package com.developersnest.devnestbackend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "devnest.jwt")
public class AuthProperties {

    /**
     * Secret key used to sign JWT tokens. Prefer a 256-bit length string.
     */
    private String secret = "replace-this-secret-for-production";

    /**
     * Token issuer name.
     */
    private String issuer = "dev-nest";

    /**
     * Access token validity in seconds.
     */
    private long accessTokenValiditySeconds = 3600;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public long getAccessTokenValiditySeconds() {
        return accessTokenValiditySeconds;
    }

    public void setAccessTokenValiditySeconds(long accessTokenValiditySeconds) {
        this.accessTokenValiditySeconds = accessTokenValiditySeconds;
    }
}
