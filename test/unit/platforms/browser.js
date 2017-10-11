import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import BrowserOauthFlow from "platforms/browser";

describe("`browser` platform class", function () {

    const options = {
        credentialToken: "credentialToken",
        host: "host",
        loginUrl: "loginUrl"
    };

    var browserOauthFlow = {};

    beforeEach(function () {
        browserOauthFlow = new BrowserOauthFlow(options);
    });

    describe("`constructor` method", function () {

        it("should set initial variable", function () {
            expect(browserOauthFlow.credentialToken).to.equal("credentialToken");
            expect(browserOauthFlow.host).to.equal("host");
            expect(browserOauthFlow.loginUrl).to.equal("loginUrl");
            expect(browserOauthFlow._credentialSecretPromise).to.be.an.instanceOf(Promise);
            expect(browserOauthFlow._resolvePromise).to.be.a("function");
            expect(browserOauthFlow._rejectPromise).to.be.a("function");
        });

    });

    describe("`_startPolling` private method", function () {

        const instance = {
            credentialToken: "credentialToken",
            intervalId: 1,
            _onMessage: sinon.spy(),
            host: "host",
            popup: {
                postMessage: sinon.spy()
            }
        };

        beforeEach(function () {
            instance._onMessage.reset();
            instance.popup.postMessage.reset();
            global.window = {
                setInterval: sinon.spy(),
                addEventListener: sinon.spy()
            };
        });

        afterEach(function () {
            delete global.window;
        });

        it("should call `setInterval` function with the correct parameter", function () {
            browserOauthFlow._startPolling.call(instance);
            expect(window.setInterval).to.have.callCount(1);
            expect(window.setInterval).to.have.been.calledWith(sinon.match.func, 100);
        });

        it("should call `postMessage` function with the correct parameter", function () {
            browserOauthFlow._startPolling.call(instance);
            window.setInterval.getCall(0).args[0]();
            expect(instance.popup.postMessage).to.have.callCount(1);
            expect(instance.popup.postMessage).to.have.been.calledWith(`{"credentialToken":"credentialToken"}`, "host");
        });

        it("should call `addEventListener` with the correct parameter", function () {
            browserOauthFlow._startPolling.call(instance);
            expect(window.addEventListener).to.have.callCount(1);
            expect(window.addEventListener).to.have.been.calledWith("message", sinon.match.func);
        });

        it("should call `_onMessage` on the correct instance", function () {
            browserOauthFlow._startPolling.call(instance);
            // Simulate "message" event
            window.addEventListener.getCall(0).args[1]({});
            expect(instance._onMessage).to.have.callCount(1);
            expect(instance._onMessage).to.have.been.calledOn(instance);
        });

    });

    describe("`_stopPolling` private method", function () {

        beforeEach(function () {
            global.window = {
                clearInterval: sinon.spy()
            };
        });

        afterEach(function () {
            delete global.window;
        });

        it("should clear the interval", function () {
            const instance = {
                intervalId: {}
            };
            browserOauthFlow._stopPolling.call(instance);
            expect(window.clearInterval).to.have.callCount(1);
            expect(window.clearInterval).to.have.been.calledWith({});
        });

    });

    describe("`_onMessage` private method", function () {

        it("shouldn't call `_resolvePromise` if `origin` has a different host than our instance", function () {
            const onMessageOptions = {
                data: `{"credentialToken":"credentialToken","credentialSecret":"credentialSecret"}`,
                origin: "http://remotehost:3000"
            };
            const instance = {
                credentialToken: "credentialToken",
                host: "localhost:3000",
                _resolvePromise: sinon.spy(),
                _rejectPromise: sinon.spy()
            };
            browserOauthFlow._onMessage.call(instance, onMessageOptions);
            expect(instance._resolvePromise).to.have.callCount(0);
            expect(instance._rejectPromise).to.have.callCount(0);
        });

        it("should call `_resolvePromise` if `origin` has the same host of our instance", function () {
            const onMessageOptions = {
                data: `{"credentialToken":"credentialToken","credentialSecret":"credentialSecret"}`,
                origin: "http://localhost:3000"
            };
            const instance = {
                credentialToken: "credentialToken",
                host: "localhost:3000",
                _resolvePromise: sinon.spy(),
                _rejectPromise: sinon.spy()
            };
            browserOauthFlow._onMessage.call(instance, onMessageOptions);
            expect(instance._resolvePromise).to.have.callCount(1);
            expect(instance._rejectPromise).to.have.callCount(0);
        });

        it("shouldn't call `_resolvePromise` if `credentialToken` in message is different from `credentialToken` in instance", function () {
            const onMessageOptions = {
                data: `{"credentialToken":"differentCredentialToken","credentialSecret":"credentialSecret"}`,
                origin: "host"
            };
            const instance = {
                credentialToken: "credentialToken",
                host: "host",
                _resolvePromise: sinon.spy(),
                _rejectPromise: sinon.spy()
            };
            browserOauthFlow._onMessage.call(instance, onMessageOptions);
            expect(instance._resolvePromise).to.have.callCount(0);
            expect(instance._rejectPromise).to.have.callCount(0);
        });

        it("should call `_resolvePromise` if `credentialToken` in message is equal to `credentialToken` in instance", function () {
            const onMessageOptions = {
                data: `{"credentialToken":"credentialToken","credentialSecret":"credentialSecret"}`,
                origin: "http://localhost:3000"
            };
            const instance = {
                credentialToken: "credentialToken",
                host: "localhost:3000",
                _resolvePromise: sinon.spy(),
                _rejectPromise: sinon.spy()
            };
            browserOauthFlow._onMessage.call(instance, onMessageOptions);
            expect(instance._resolvePromise).to.have.callCount(1);
            expect(instance._resolvePromise).to.have.been.calledWith({
                credentialToken: "credentialToken",
                credentialSecret: "credentialSecret"
            });
            expect(instance._rejectPromise).to.have.callCount(0);
        });

        it("should call `_rejectPromise` if `message` contain an error", function () {
            const onMessageOptions = {
                data: `{"error": "Error message"}`,
                origin: "http://localhost:3000"
            };
            const instance = {
                credentialToken: "credentialToken",
                host: "localhost:3000",
                _rejectPromise: sinon.spy(),
                _resolvePromise: sinon.spy()
            };
            browserOauthFlow._onMessage.call(instance, onMessageOptions);
            expect(instance._rejectPromise).to.have.callCount(1);
            expect(instance._rejectPromise).to.have.been.calledWith("Error message");
        });

    });

    describe("`_openPopup` private method", function () {

        beforeEach(function () {
            global.window = {
                open: sinon.stub()
            };
        });

        afterEach(function () {
            delete global.window;
        });

        it("should call the `open` popup function with the correct parameter", function () {
            window.open.reset();
            window.open.returns({});
            browserOauthFlow._openPopup();
            expect(window.open).to.have.callCount(1);
            expect(window.open).to.have.been.calledWith("loginUrl", "_blank", "location=no,toolbar=no");
        });

        it("should call the `focus` function of popup if it is defined", function () {
            window.open.reset();
            window.open.returns({
                focus: sinon.spy()
            });
            const instance = {};
            browserOauthFlow._openPopup.call(instance);
            expect(instance.popup.focus).to.have.callCount(1);
        });

        it("shouldn't call the `focus` function of popup if it isn't defined", function () {
            window.open.reset();
            window.open.returns(sinon.spy());
            const instance = {};
            browserOauthFlow._openPopup.call(instance);
            expect(instance.popup).to.have.callCount(0);
        });

    });

    describe("`_closePopup` private method", function () {

        it("should call the close function of the popup", function () {
            const instance = {
                popup: {
                    close: sinon.spy()
                }
            };
            browserOauthFlow._closePopup.call(instance);
            expect(instance.popup.close).to.have.callCount(1);
        });

    });

    describe("`init` method", function () {

        const instance = {
            _openPopup: sinon.spy(),
            _startPolling: sinon.spy(),
            _stopPolling: sinon.spy(),
            _closePopup: sinon.spy(),
            _onMessage: sinon.spy()
        };

        beforeEach(function () {
            instance._openPopup.reset();
            instance._startPolling.reset();
            instance._stopPolling.reset();
            instance._closePopup.reset();
            instance._onMessage.reset();
        });

        it("should call the `_openPopup` private function", function () {
            instance._credentialSecretPromise = Promise.resolve();
            browserOauthFlow.init.call(instance);
            expect(instance._openPopup).to.have.callCount(1);
        });

        it("should call the `_startPolling` private function", function () {
            instance._credentialSecretPromise = Promise.resolve();
            browserOauthFlow.init.call(instance);
            expect(instance._startPolling).to.have.callCount(1);
        });

        it("should call the `_stopPolling` and `_closePopup` private function if the promise resolve", function () {
            instance._credentialSecretPromise = Promise.resolve();
            browserOauthFlow.init.call(instance);
            return instance._credentialSecretPromise
                .then(function () {
                    expect(instance._stopPolling).to.have.callCount(1);
                    expect(instance._closePopup).to.have.callCount(1);
                });
        });

        it("should return `credentialSecret`", function () {
            instance._credentialSecretPromise = Promise.resolve("credentialSecret");
            browserOauthFlow.init.call(instance);
            return instance._credentialSecretPromise
                .then(function (credentialSecret) {
                    expect(credentialSecret).to.equal("credentialSecret");
                });
        });

    });

});
