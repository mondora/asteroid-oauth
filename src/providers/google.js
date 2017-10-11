import parse from "url-parse";

import generateCredentialToken from "../lib/generate-credential-token";
import getOauthState from "../lib/get-oauth-state";
import getOauthClientId from "../lib/get-oauth-client-id";
import getOauthProtocol from "../lib/get-oauth-protocol";

export const name = "google";

export function getOptions ({url, configCollection, scope, offlineAccess, forcePrompt}) {
    const credentialToken = generateCredentialToken();
    const {protocol, host} = url;
    const query = {
        /*
        *   `response_type` determines how the callback url is formed by the
        *   google oauth service:
        *       - `code` -> put the parameters in the querystring
        *       - `token` -> put the parameters in the fragment
        *   Meteor currently only supports a `code` response type
        */
        "response_type": "code",
        "client_id": getOauthClientId(configCollection),
        "redirect_uri": getOauthProtocol(protocol) + `//${host}/_oauth/google`,
        "state": getOauthState(credentialToken),
        "scope": scope || "openid email"
    };

    if (offlineAccess) query.access_type = "offline";
    if (forcePrompt) query.approval_prompt = "force";

    const loginUrl = parse("https://accounts.google.com/o/oauth2/auth")
        .set("query", query)
        .toString();
    return {credentialToken, loginUrl};
}
