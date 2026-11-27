CREATE DOMAIN SLUG AS TEXT CONSTRAINT slug_format CHECK (
    VALUE ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
) CONSTRAINT slug_length CHECK (
    char_length(VALUE) BETWEEN 1 AND 100
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    email TEXT NOT NULL CHECK (
        length(email) <= 320
        AND email ~ '.+@.+\..+'
    ),
    username TEXT NOT NULL CHECK (
        length(username) BETWEEN 3 AND 30
    ),
    avatar TEXT,
    status TEXT NOT NULL CHECK (
        status IN ('active', 'deleted')
    ) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_lower_email_idx ON users (lower(email));

CREATE UNIQUE INDEX users_lower_username_idx ON users (lower(username));

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    ROLE TEXT NOT NULL CHECK (
        ROLE IN ('user', 'seller', 'admin')
    ),
    PRIMARY KEY (user_id, ROLE)
);

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    name TEXT NOT NULL,
    slug SLUG NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    name TEXT NOT NULL,
    slug SLUG NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_categories (
    game_id UUID NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, category_id)
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    seller_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    game_id UUID NOT NULL,
    category_id UUID NOT NULL,
    name TEXT NOT NULL CHECK (
        length(name) BETWEEN 10 AND 100
    ),
    description TEXT CHECK (
        length(description) BETWEEN 10 AND 3000
    ),
    status TEXT NOT NULL CHECK (
        status IN (
            'active',
            'paused',
            'sold_out',
            'deleted'
        )
    ) DEFAULT 'active',
    price NUMERIC(20, 4) NOT NULL CHECK (price > 0),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    attrs JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id, category_id) REFERENCES game_categories (game_id, category_id) ON DELETE RESTRICT
);

CREATE TABLE listing_images (
    listing_id UUID NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    priority SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (listing_id, image_url)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    listing_id UUID NOT NULL REFERENCES listings (id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (
        status IN (
            'awaiting_payment',
            'in_progress',
            'delivered',
            'dispute',
            'completed',
            'canceled',
            'unpaid',
            'error'
        )
    ) DEFAULT 'awaiting_payment',
    unit_price NUMERIC(20, 4) NOT NULL CHECK (unit_price > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    order_id UUID NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    COMMENT TEXT CHECK (
        length(COMMENT) BETWEEN 10 AND 200
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_messages (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users (id) ON DELETE RESTRICT,
    message TEXT NOT NULL CHECK (
        length(message) BETWEEN 1 AND 300
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    type TEXT NOT NULL CHECK (
        type IN ('user', 'escrow', 'fee')
    ),
    owner_id UUID REFERENCES users (id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        type != 'user'
        OR owner_id IS NOT NULL
    )
);

CREATE TABLE ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    order_id UUID REFERENCES orders (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    account_id UUID NOT NULL REFERENCES accounts (id),
    transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),
    amount NUMERIC(20, 4) NOT NULL CHECK (amount != 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
)