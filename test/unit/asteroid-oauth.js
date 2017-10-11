import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import * as asteroidOauth from "asteroid-oauth";

describe("`asteroid-oauth` mixin", function () {

    describe("the `init` method", function () {

        it("should set the `oauth` property with the correct parameter", function () {
            const options = {
                endpoint: "http://test.com:8080/test",
                platform: "platform"
            };
            const instance = {
                subscribe: sinon.spy()
            };
            asteroidOauth.init.call(instance, options);
            expect(instance.oauth.platform).to.equal("platform");
            expect(instance.oauth.url.host).to.equal("test.com:8080");
            expect(instance.oauth.url).to.be.an("object");
        });

        it("should call the `subscribe` function with the correct parameter", function () {
            const options = {
                endpoint: "http://test.com:8080/test",
                platform: "platform"
            };
            const instance = {
                subscribe: sinon.spy()
            };
            asteroidOauth.init.call(instance, options);
            expect(instance.subscribe).to.have.callCount(1);
            expect(instance.subscribe).to.have.been.calledWith("meteor.loginServiceConfiguration");
        });

    });

    describe("the `registerOauthProvider` method", function () {

        const providers = {};

        before(function () {
            asteroidOauth.__Rewire__("providers", providers);
        });

        after(function () {
            asteroidOauth.__ResetDependency__("providers");
        });

        it("should set the providers", function () {
            const options = {
                name: "provider",
                getOptions: {}
            };
            asteroidOauth.registerOauthProvider(options);
            expect(providers.provider).to.deep.equal({name: "provider", getOptions: {}});
        });

    });

    describe("the `loginWith` method", function () {

        const providers = {
            provider: {
                name: "provider",
                getOptions: sinon.stub().returns({credentialToken: "credentialToken", loginUrl: "loginUrl"})
            }
        };
        const providerName = "provider";
        const openOauthPopup = sinon.spy();

        beforeEach(function () {
            openOauthPopup.reset();
            asteroidOauth.__Rewire__("openOauthPopup", openOauthPopup);
            providers.provider.getOptions.reset();
            asteroidOauth.__Rewire__("providers", providers);
        });

        afterEach(function () {
            asteroidOauth.__ResetDependency__("openOauthPopup");
            asteroidOauth.__ResetDependency__("providers");
        });

        it("should call the `getOptions` function with the correct parameters", function () {
            const instance = {
                oauth: {
                    url: {}
                },
                getServiceConfig: sinon.spy()
            };
            asteroidOauth.loginWith.call(instance, providerName, {scope: "scope"}, true, true);
            expect(providers.provider.getOptions).to.have.callCount(1);
            expect(providers.provider.getOptions).to.have.been.calledWith({
                url: {},
                configCollection: instance.getServiceConfig(),
                scope: {scope: "scope"},
                offlineAccess: true,
                forcePrompt: true
            });
        });

        it("should call the `openOauthPopup` function with the correct parameters", function () {
            const instance = {
                oauth: {
                    url: {
                        host: "host"
                    },
                    platform: "platform"
                },
                login: sinon.spy(),
                getServiceConfig: sinon.spy()
            };
            asteroidOauth.loginWith.call(instance, providerName, {});
            expect(openOauthPopup).to.have.callCount(1);
            expect(openOauthPopup).to.have.been.calledWith(
                "platform",
                "host",
                "credentialToken",
                "loginUrl",
                sinon.match.func
            );
            openOauthPopup.getCall(0).args[4]({token: "token"});
            expect(instance.login).to.have.callCount(1);
            expect(instance.login).to.have.been.calledWith({
                oauth: {
                    token: "token"
                }
            });
        });

    });

});
