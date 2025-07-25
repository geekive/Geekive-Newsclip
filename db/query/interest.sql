-- name: selectTopic
SELECT
  T.TOPIC_UID                       AS topic_uid
  , T.TOPIC_NAME                    AS topic_name
  , (I.TOPIC_UID IS NOT NULL)       AS is_interested
  , T.REGISTRATION_USER = :user_uid AS is_mine
FROM
  TOPIC T
  LEFT JOIN INTEREST I
  ON
	  I.TOPIC_UID = T.TOPIC_UID
	  AND I.USER_UID = :user_uid
WHERE
  FLAG_DELETED = 'N'
ORDER BY
	TOPIC_NAME ASC;

-- name: insertInterest
INSERT OR IGNORE INTO INTEREST (USER_UID, TOPIC_UID, "ORDER")
SELECT
  :user_uid
  , :topic_uid
  , COALESCE(MAX("ORDER"), 0) + 1
FROM 
  INTEREST
WHERE 
  USER_UID = :user_uid;

-- name: deleteInterest
DELETE FROM INTEREST
WHERE
  USER_UID = :user_uid
  AND TOPIC_UID NOT IN (__TOPIC_UID_LIST__)

-- name: cleanInterestOrder
WITH RANKED AS (
  SELECT
    USER_UID
    , TOPIC_UID
    , ROW_NUMBER() OVER (ORDER BY "ORDER") AS NEW_ORDER
  FROM 
    INTEREST
  WHERE 
    USER_UID = :user_uid
)
UPDATE INTEREST
SET 
  "ORDER" = (
    SELECT 
      NEW_ORDER
    FROM 
      RANKED
    WHERE 
      RANKED.TOPIC_UID = INTEREST.TOPIC_UID
)
WHERE USER_UID = :user_uid;

-- name: updateInterestOrder
UPDATE INTEREST
SET
  "ORDER" = :order
WHERE
  USER_UID      = :user_uid
  AND TOPIC_UID = :topic_uid