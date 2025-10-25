-- DevNest initial schema focusing on core blogging features.
-- Includes users, posts, metrics, interactions, and tagging.

CREATE TABLE dbo.users (
    user_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    username           NVARCHAR(50)  NOT NULL,
    email              NVARCHAR(255) NOT NULL,
    password_hash      VARBINARY(512) NOT NULL,
    display_name       NVARCHAR(80)  NOT NULL,
    role               VARCHAR(20)   NOT NULL DEFAULT 'member',
    bio                NVARCHAR(400) NULL,
    profile_image_url  NVARCHAR(400) NULL,
    last_login_at      DATETIME2(0)  NULL,
    created_at         DATETIME2(0)  NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
    updated_at         DATETIME2(0)  NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSUTCDATETIME()
);

CREATE UNIQUE INDEX IX_users_username ON dbo.users(username);
CREATE UNIQUE INDEX IX_users_email ON dbo.users(email);

CREATE TABLE dbo.posts (
    post_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    author_id          BIGINT        NOT NULL,
    title              NVARCHAR(200) NOT NULL,
    slug               NVARCHAR(220) NOT NULL,
    summary            NVARCHAR(500) NULL,
    content_markdown   NVARCHAR(MAX) NOT NULL,
    content_html       NVARCHAR(MAX) NULL,
    hero_image_url     NVARCHAR(400) NULL,
    is_pinned          BIT           NOT NULL DEFAULT 0,
    published_at       DATETIME2(0)  NULL,
    created_at         DATETIME2(0)  NOT NULL CONSTRAINT DF_posts_created_at DEFAULT SYSUTCDATETIME(),
    updated_at         DATETIME2(0)  NOT NULL CONSTRAINT DF_posts_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_posts_author FOREIGN KEY (author_id) REFERENCES dbo.users(user_id),
    CONSTRAINT UQ_posts_slug UNIQUE (slug)
);

CREATE INDEX IX_posts_author_created ON dbo.posts(author_id, created_at DESC);
CREATE INDEX IX_posts_published ON dbo.posts(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IX_posts_is_pinned ON dbo.posts(is_pinned) WHERE is_pinned = 1;

CREATE TABLE dbo.post_metrics (
    post_id        BIGINT NOT NULL PRIMARY KEY,
    views_count    BIGINT NOT NULL DEFAULT 0,
    likes_count    BIGINT NOT NULL DEFAULT 0,
    last_view_at   DATETIME2(0) NULL,
    last_like_at   DATETIME2(0) NULL,
    FOREIGN KEY (post_id) REFERENCES dbo.posts(post_id) ON DELETE CASCADE
);

CREATE TABLE dbo.post_likes (
    post_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    liked_at    DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES dbo.posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);

CREATE TABLE dbo.tags (
    tag_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(80)  NOT NULL,
    slug        NVARCHAR(80)  NOT NULL,
    description NVARCHAR(300) NULL,
    created_at  DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_tags_slug UNIQUE (slug)
);

CREATE TABLE dbo.post_tags (
    post_id BIGINT NOT NULL,
    tag_id  BIGINT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES dbo.posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)  REFERENCES dbo.tags(tag_id) ON DELETE CASCADE
);

CREATE INDEX IX_post_tags_tag ON dbo.post_tags(tag_id);

CREATE TABLE dbo.comments (
    comment_id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    post_id             BIGINT        NOT NULL,
    author_id           BIGINT        NOT NULL,
    parent_comment_id   BIGINT        NULL,
    body_markdown       NVARCHAR(MAX) NOT NULL,
    body_html           NVARCHAR(MAX) NULL,
    is_deleted          BIT           NOT NULL DEFAULT 0,
    created_at          DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (post_id) REFERENCES dbo.posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES dbo.users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (parent_comment_id) REFERENCES dbo.comments(comment_id) ON DELETE NO ACTION
);

CREATE INDEX IX_comments_post_created ON dbo.comments(post_id, created_at DESC);
CREATE INDEX IX_comments_author ON dbo.comments(author_id);

CREATE TABLE dbo.comment_reactions (
    comment_id   BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    reaction     VARCHAR(20) NOT NULL DEFAULT 'like',
    reacted_at   DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (comment_id, user_id, reaction),
    FOREIGN KEY (comment_id) REFERENCES dbo.comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES dbo.users(user_id) ON DELETE CASCADE
);
