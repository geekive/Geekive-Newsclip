-- name: selectRandomTopicList
SELECT
	TOPIC_UID       	AS topic_uid
	, TOPIC_NAME    	AS topic_name
	, FALSE				AS is_mine
FROM 
	TOPIC
WHERE
	FLAG_DELETED = 'N'
ORDER BY 
	RANDOM()
LIMIT 8;

-- name: selectTopicList
SELECT
    T.TOPIC_UID       	AS topic_uid
	, T.TOPIC_NAME    	AS topic_name
	, CASE 
		WHEN 
            T.REGISTRATION_USER = :user_uid
		THEN 
            TRUE
		ELSE 
            FALSE
	END	            	AS is_mine
FROM
    TOPIC T
	INNER JOIN INTEREST I
	ON
		I.TOPIC_UID 	= T.TOPIC_UID
		AND I.USER_UID 	= :user_uid
WHERE
    T.FLAG_DELETED = 'N'
ORDER BY
    T.REGISTRATION_DATE DESC;

-- name: selectDateList
SELECT
	  DATE
	, MAX(COUNT_PER_TOPIC) AS DATE_SLOT_COUNT
FROM (
	SELECT
		  DATE
		, TOPIC_UID
		, COUNT(*) AS COUNT_PER_TOPIC
	FROM
		NEWS
	GROUP BY
		  DATE
		, TOPIC_UID
) AS SUB
GROUP BY
	DATE
ORDER BY
	DATE ASC;

-- name: selectNewsList
SELECT 
	NEWS_UID
	, TOPIC_UID
	, TITLE
	, DATE
	, MEMO
    , IMPORTANCE
FROM 
	NEWS
WHERE
	FLAG_DELETED = 'N'
ORDER BY
	DATE ASC, TOPIC_UID ASC, REGISTRATION_DATE ASC;