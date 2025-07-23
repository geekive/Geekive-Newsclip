-- name: selectTopic
SELECT
  T.TOPIC_UID                 AS topic_uid
  , T.TOPIC_NAME              AS topic_name
  , (I.TOPIC_UID IS NOT NULL) AS is_interested
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
INSERT INTO INTEREST (
  USER_UID
  , TOPIC_UID
) VALUES (
  :user_uid
  , :topic_uid
);