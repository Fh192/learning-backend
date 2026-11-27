BEGIN;

-- ============================================================
-- Users
-- ============================================================
INSERT INTO users (email, username, avatar, status, created_at) VALUES
    ('admin@market.dev',   'admin',      NULL,                                   'active',  now() - interval '120 days'),
    ('alice@mail.com',     'alice_shop', 'https://cdn.market.dev/avatars/1.png', 'active',  now() - interval '90 days'),
    ('bob@mail.com',       'bob_trader', 'https://cdn.market.dev/avatars/2.png', 'active',  now() - interval '80 days'),
    ('charlie@mail.com',   'charlie',    NULL,                                   'active',  now() - interval '60 days'),
    ('diana@mail.com',     'diana',      'https://cdn.market.dev/avatars/4.png', 'active',  now() - interval '45 days'),
    ('eve@mail.com',       'eve_gamer',  NULL,                                   'active',  now() - interval '30 days'),
    ('frank@mail.com',     'frank',      NULL,                                   'deleted', now() - interval '100 days');

INSERT INTO user_roles (user_id, role)
SELECT u.id, r.role
FROM (VALUES
    ('admin',      'admin'),
    ('admin',      'user'),
    ('alice_shop', 'user'),
    ('alice_shop', 'seller'),
    ('bob_trader', 'user'),
    ('bob_trader', 'seller'),
    ('charlie',    'user'),
    ('diana',      'user'),
    ('eve_gamer',  'user'),
    ('frank',      'user')
) AS r(username, role)
JOIN users u ON u.username = r.username;

-- ============================================================
-- Games & categories
-- ============================================================
INSERT INTO games (name, slug) VALUES
    ('Counter-Strike 2',  'counter-strike-2'),
    ('Dota 2',            'dota-2'),
    ('World of Warcraft', 'world-of-warcraft'),
    ('Genshin Impact',    'genshin-impact');

INSERT INTO categories (name, slug) VALUES
    ('Items',    'items'),
    ('Accounts', 'accounts'),
    ('Currency', 'currency'),
    ('Boosting', 'boosting');

INSERT INTO game_categories (game_id, category_id)
SELECT g.id, c.id
FROM (VALUES
    ('counter-strike-2',  'items'),
    ('counter-strike-2',  'accounts'),
    ('counter-strike-2',  'boosting'),
    ('dota-2',            'items'),
    ('dota-2',            'accounts'),
    ('dota-2',            'boosting'),
    ('world-of-warcraft', 'currency'),
    ('world-of-warcraft', 'accounts'),
    ('world-of-warcraft', 'boosting'),
    ('genshin-impact',    'accounts'),
    ('genshin-impact',    'currency')
) AS gc(game_slug, category_slug)
JOIN games g      ON g.slug = gc.game_slug
JOIN categories c ON c.slug = gc.category_slug;

-- ============================================================
-- Listings
-- ============================================================
INSERT INTO listings (seller_id, game_id, category_id, name, description, status, price, quantity, attrs, created_at)
SELECT u.id, g.id, c.id, l.name, l.description, l.status, l.price, l.quantity, l.attrs::jsonb, now() - l.age
FROM (VALUES
    ('alice_shop', 'counter-strike-2', 'items',
     'AK-47 | Redline (Field-Tested)',
     'Classic AK skin, float 0.21. Instant trade after payment.',
     'active', 12.5000, 3, '{"exterior": "field-tested", "float": 0.21, "stattrak": false}', interval '50 days'),

    ('alice_shop', 'counter-strike-2', 'accounts',
     'CS2 Prime account, 2000+ hours',
     'Prime status, Global Elite rank, email included, no bans.',
     'active', 45.0000, 1, '{"rank": "global-elite", "hours": 2150, "prime": true}', interval '40 days'),

    ('alice_shop', 'dota-2', 'boosting',
     'Dota 2 MMR boost +500 per order',
     'Boost by an 8k player. Time: 3-5 days. Party or solo.',
     'active', 30.0000, 10, '{"mmr_from": 2000, "mmr_to": 2500, "mode": "solo"}', interval '35 days'),

    ('bob_trader', 'world-of-warcraft', 'currency',
     'WoW Gold, 100k, EU Silvermoon',
     'Delivered via face-to-face trade or mail. Price is for 100k gold.',
     'active', 8.9900, 50, '{"server": "silvermoon", "region": "eu", "amount": 100000}', interval '30 days'),

    ('bob_trader', 'world-of-warcraft', 'boosting',
     'Mythic+ dungeon carry, key level 10',
     'Four-person team carry, loot traders included.',
     'paused', 25.0000, 5, '{"key_level": 10, "loot": true}', interval '25 days'),

    ('bob_trader', 'dota-2', 'items',
     'Arcana: Manifold Paradox (Phantom Assassin)',
     'Tradable arcana, gift via Steam.',
     'sold_out', 32.0000, 0, '{"hero": "phantom-assassin", "rarity": "arcana"}', interval '20 days'),

    ('bob_trader', 'genshin-impact', 'accounts',
     'Genshin Impact AR58 account, EU server',
     'Several 5-star characters, full access with email change.',
     'active', 120.0000, 1, '{"ar": 58, "server": "eu", "five_stars": 9}', interval '15 days'),

    ('alice_shop', 'genshin-impact', 'currency',
     'Genesis Crystals 6480 + bonus',
     NULL,
     'deleted', 85.0000, 0, '{"amount": 6480}', interval '10 days')
) AS l(seller, game_slug, category_slug, name, description, status, price, quantity, attrs, age)
JOIN users u      ON u.username = l.seller
JOIN games g      ON g.slug = l.game_slug
JOIN categories c ON c.slug = l.category_slug;

INSERT INTO listing_images (listing_id, image_url, priority)
SELECT l.id, i.url, i.priority
FROM (VALUES
    ('AK-47 | Redline (Field-Tested)',              'https://cdn.market.dev/listings/ak-redline-1.png', 0),
    ('AK-47 | Redline (Field-Tested)',              'https://cdn.market.dev/listings/ak-redline-2.png', 1),
    ('CS2 Prime account, 2000+ hours',              'https://cdn.market.dev/listings/cs2-account.png',  0),
    ('WoW Gold, 100k, EU Silvermoon',               'https://cdn.market.dev/listings/wow-gold.png',     0),
    ('Arcana: Manifold Paradox (Phantom Assassin)', 'https://cdn.market.dev/listings/pa-arcana-1.png',  0),
    ('Arcana: Manifold Paradox (Phantom Assassin)', 'https://cdn.market.dev/listings/pa-arcana-2.png',  1),
    ('Genshin Impact AR58 account, EU server',      'https://cdn.market.dev/listings/genshin-acc.png',  0)
) AS i(listing_name, url, priority)
JOIN listings l ON l.name = i.listing_name;

-- ============================================================
-- Orders
-- An order has no natural key, so it gets a fixed id that
-- reviews, messages and the ledger reference below.
-- unit_price is copied from the listing when the order is created.
-- ============================================================
INSERT INTO orders (id, listing_id, buyer_id, status, unit_price, quantity, created_at, updated_at)
SELECT o.id::uuid, l.id, u.id, o.status, l.price, o.quantity, now() - o.age, now() - o.age + interval '1 hour'
FROM (VALUES
    ('019a0000-0000-7000-8000-000000000001', 'AK-47 | Redline (Field-Tested)',              'charlie',    'completed',        1, interval '28 days'),
    ('019a0000-0000-7000-8000-000000000002', 'WoW Gold, 100k, EU Silvermoon',               'diana',      'completed',        5, interval '21 days'),
    ('019a0000-0000-7000-8000-000000000003', 'Arcana: Manifold Paradox (Phantom Assassin)', 'eve_gamer',  'completed',        1, interval '14 days'),
    ('019a0000-0000-7000-8000-000000000004', 'Dota 2 MMR boost +500 per order',             'charlie',    'in_progress',      1, interval '3 days'),
    ('019a0000-0000-7000-8000-000000000005', 'CS2 Prime account, 2000+ hours',              'diana',      'dispute',          1, interval '5 days'),
    ('019a0000-0000-7000-8000-000000000006', 'WoW Gold, 100k, EU Silvermoon',               'eve_gamer',  'canceled',         2, interval '7 days'),
    ('019a0000-0000-7000-8000-000000000007', 'Genshin Impact AR58 account, EU server',      'charlie',    'awaiting_payment', 1, interval '1 hour'),
    ('019a0000-0000-7000-8000-000000000008', 'AK-47 | Redline (Field-Tested)',              'eve_gamer',  'unpaid',           1, interval '10 days')
) AS o(id, listing_name, buyer, status, quantity, age)
JOIN listings l ON l.name = o.listing_name
JOIN users u    ON u.username = o.buyer;

-- ============================================================
-- Reviews (completed orders only)
-- ============================================================
INSERT INTO reviews (order_id, rating, comment) VALUES
    ('019a0000-0000-7000-8000-000000000001', 5, 'Fast trade, the skin matches the description.'),
    ('019a0000-0000-7000-8000-000000000002', 4, 'Gold arrived in about an hour. Good seller.'),
    ('019a0000-0000-7000-8000-000000000003', 5, NULL);

-- ============================================================
-- Order messages (sender_id NULL = system message)
-- ============================================================
INSERT INTO order_messages (order_id, sender_id, message, created_at)
SELECT m.order_id::uuid, u.id, m.message, o.created_at + m.offset_
FROM (VALUES
    ('019a0000-0000-7000-8000-000000000001', NULL,         'Order paid. Waiting for the seller.',               interval '1 minute'),
    ('019a0000-0000-7000-8000-000000000001', 'alice_shop', 'Hi! Sent the trade offer, please check Steam.',     interval '10 minutes'),
    ('019a0000-0000-7000-8000-000000000001', 'charlie',    'Got it, thanks!',                                   interval '15 minutes'),
    ('019a0000-0000-7000-8000-000000000004', 'alice_shop', 'Starting the boost tonight. Please do not log in.', interval '2 hours'),
    ('019a0000-0000-7000-8000-000000000004', 'charlie',    'Ok, how long will it take?',                        interval '3 hours'),
    ('019a0000-0000-7000-8000-000000000005', 'diana',      'The account email cannot be changed.',              interval '1 day'),
    ('019a0000-0000-7000-8000-000000000005', NULL,         'Dispute opened. An admin will join the chat.',      interval '1 day 1 minute'),
    ('019a0000-0000-7000-8000-000000000005', 'admin',      'Seller, please provide the original email access.', interval '1 day 2 hours'),
    ('019a0000-0000-7000-8000-000000000006', 'eve_gamer',  'Sorry, ordered by mistake.',                        interval '5 minutes'),
    ('019a0000-0000-7000-8000-000000000006', NULL,         'Order canceled by buyer.',                          interval '6 minutes')
) AS m(order_id, sender, message, offset_)
JOIN orders o     ON o.id = m.order_id::uuid
LEFT JOIN users u ON u.username = m.sender;

-- ============================================================
-- Accounts: system escrow, fee and external (money coming from
-- outside the platform, e.g. a payment provider), one per active user
-- ============================================================
INSERT INTO accounts (type, owner_id) VALUES
    ('escrow',   NULL),
    ('fee',      NULL),
    ('external', NULL);

INSERT INTO accounts (type, owner_id)
SELECT 'user', id FROM users WHERE status = 'active';

-- ============================================================
-- Deposits (top-ups): external -amount -> user +amount, no order.
-- Each buyer tops up before the first order, so no balance goes negative.
-- ============================================================
CREATE TEMP TABLE seed_deposits ON COMMIT DROP AS
SELECT uuidv7() AS id, u.id AS user_id, d.amount, now() - d.age AS created_at
FROM (VALUES
    ('charlie',   100.0000, interval '29 days'),
    ('diana',      60.0000, interval '22 days'),
    ('diana',      40.0000, interval '6 days'),
    ('eve_gamer',  50.0000, interval '15 days')
) AS d(username, amount, age)
JOIN users u ON u.username = d.username;

INSERT INTO ledger_transactions (id, order_id, created_at)
SELECT id, NULL, created_at FROM seed_deposits;

INSERT INTO ledger_entries (account_id, transaction_id, amount, created_at)
SELECT a.id, d.id, -d.amount, d.created_at
FROM seed_deposits d
JOIN accounts a ON a.type = 'external'
UNION ALL
SELECT a.id, d.id, d.amount, d.created_at
FROM seed_deposits d
JOIN accounts a ON a.type = 'user' AND a.owner_id = d.user_id;

-- ============================================================
-- Ledger (double-entry: entries in each transaction sum to 0)
--   payment:    buyer  -total  -> escrow +total
--   completion: escrow -total  -> seller +90%, fee +10%
--   refund:     escrow -total  -> buyer  +total
-- ============================================================
CREATE TEMP TABLE seed_ledger (
    tx_key   TEXT,
    order_id UUID,
    account  TEXT,  -- 'escrow' | 'fee' | 'buyer' | 'seller'
    share    NUMERIC,  -- multiplier of the order total
    at       INTERVAL  -- delay after the order was created
) ON COMMIT DROP;

INSERT INTO seed_ledger VALUES
    -- order 1: paid and completed
    ('o1-pay',      '019a0000-0000-7000-8000-000000000001', 'buyer',  -1.0, interval '1 minute'),
    ('o1-pay',      '019a0000-0000-7000-8000-000000000001', 'escrow',  1.0, interval '1 minute'),
    ('o1-complete', '019a0000-0000-7000-8000-000000000001', 'escrow', -1.0, interval '1 day'),
    ('o1-complete', '019a0000-0000-7000-8000-000000000001', 'seller',  0.9, interval '1 day'),
    ('o1-complete', '019a0000-0000-7000-8000-000000000001', 'fee',     0.1, interval '1 day'),
    -- order 2: paid and completed
    ('o2-pay',      '019a0000-0000-7000-8000-000000000002', 'buyer',  -1.0, interval '1 minute'),
    ('o2-pay',      '019a0000-0000-7000-8000-000000000002', 'escrow',  1.0, interval '1 minute'),
    ('o2-complete', '019a0000-0000-7000-8000-000000000002', 'escrow', -1.0, interval '2 days'),
    ('o2-complete', '019a0000-0000-7000-8000-000000000002', 'seller',  0.9, interval '2 days'),
    ('o2-complete', '019a0000-0000-7000-8000-000000000002', 'fee',     0.1, interval '2 days'),
    -- order 3: paid and completed
    ('o3-pay',      '019a0000-0000-7000-8000-000000000003', 'buyer',  -1.0, interval '1 minute'),
    ('o3-pay',      '019a0000-0000-7000-8000-000000000003', 'escrow',  1.0, interval '1 minute'),
    ('o3-complete', '019a0000-0000-7000-8000-000000000003', 'escrow', -1.0, interval '1 day'),
    ('o3-complete', '019a0000-0000-7000-8000-000000000003', 'seller',  0.9, interval '1 day'),
    ('o3-complete', '019a0000-0000-7000-8000-000000000003', 'fee',     0.1, interval '1 day'),
    -- order 4 (in_progress) and order 5 (dispute): money held in escrow
    ('o4-pay',      '019a0000-0000-7000-8000-000000000004', 'buyer',  -1.0, interval '1 minute'),
    ('o4-pay',      '019a0000-0000-7000-8000-000000000004', 'escrow',  1.0, interval '1 minute'),
    ('o5-pay',      '019a0000-0000-7000-8000-000000000005', 'buyer',  -1.0, interval '1 minute'),
    ('o5-pay',      '019a0000-0000-7000-8000-000000000005', 'escrow',  1.0, interval '1 minute'),
    -- order 6: paid, then canceled and refunded
    ('o6-pay',      '019a0000-0000-7000-8000-000000000006', 'buyer',  -1.0, interval '1 minute'),
    ('o6-pay',      '019a0000-0000-7000-8000-000000000006', 'escrow',  1.0, interval '1 minute'),
    ('o6-refund',   '019a0000-0000-7000-8000-000000000006', 'escrow', -1.0, interval '6 minutes'),
    ('o6-refund',   '019a0000-0000-7000-8000-000000000006', 'buyer',   1.0, interval '6 minutes');
    -- orders 7 (awaiting_payment) and 8 (unpaid) have no money movement

CREATE TEMP TABLE seed_tx ON COMMIT DROP AS
SELECT DISTINCT ON (s.tx_key)
       uuidv7() AS id, s.tx_key, s.order_id, o.created_at + s.at AS created_at
FROM seed_ledger s
JOIN orders o ON o.id = s.order_id
ORDER BY s.tx_key;

INSERT INTO ledger_transactions (id, order_id, created_at)
SELECT id, order_id, created_at FROM seed_tx;

INSERT INTO ledger_entries (account_id, transaction_id, amount, created_at)
SELECT a.id, t.id, round(o.unit_price * o.quantity * s.share, 4), t.created_at
FROM seed_ledger s
JOIN seed_tx t   ON t.tx_key = s.tx_key
JOIN orders o    ON o.id = s.order_id
JOIN listings l  ON l.id = o.listing_id
JOIN accounts a  ON
       (s.account = 'escrow' AND a.type = 'escrow')
    OR (s.account = 'fee'    AND a.type = 'fee')
    OR (s.account = 'buyer'  AND a.type = 'user' AND a.owner_id = o.buyer_id)
    OR (s.account = 'seller' AND a.type = 'user' AND a.owner_id = l.seller_id);

COMMIT;
