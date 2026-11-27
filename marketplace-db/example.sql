WITH
    seller_rating AS (
        SELECT u.id, u.username, ROUND(avg(r.rating), 2) AS rating
        FROM
            reviews r
            JOIN orders o ON r.order_id = o.id
            JOIN listings l ON o.listing_id = l.id
            JOIN users u ON l.seller_id = u.id
        GROUP BY
            u.id,
            u.username
    )

-- active listings with seller reviews
SELECT l.name, sr.username AS seller, sr.rating
FROM
    listings l
    JOIN games g ON l.game_id = g.id
    JOIN seller_rating sr ON l.seller_id = sr.id
WHERE
    l.status = 'active';

-- users order history
SELECT u.username, l.name AS listing_name, o.unit_price * o.quantity AS amount, o.created_at
FROM
    orders o
    JOIN users u ON o.buyer_id = u.id
    JOIN listings l ON o.listing_id = l.id
ORDER BY u.id, o.created_at;

-- users balance
SELECT a.owner_id, coalesce(SUM(le.amount), 0) AS balance
FROM accounts a
    LEFT JOIN ledger_entries le ON a.id = le.account_id
WHERE
    a.type = 'user'
GROUP BY
    a.owner_id;