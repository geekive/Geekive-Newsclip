-- name: selectTopic
SELECT
  TOPIC_UID     AS topic_uid
  , TOPIC_NAME  AS topic_name
FROM
  TOPIC
WHERE
  FLAG_DELETED = 'N'
ORDER BY
	TOPIC_NAME ASC;
