-- name: selectTopicList
SELECT
    TOPIC_UID,
    TOPIC_NAME
FROM
    TOPIC
WHERE
    FLAG_DELETED = 'N'
ORDER BY
    REGISTRATION_DATE DESC;

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

-- name: selectNewsList-REMOVED
SELECT
	TOPIC_UID || '-' || DATE || '-' || IDX AS ID
	, NEWS_UID
	, TOPIC_UID
	, TITLE
	, SUBSTR(DATE, 3, 2) || '. ' || SUBSTR(DATE, 6, 2) || '. ' || SUBSTR(DATE, 9, 2) AS DATE
FROM
    (
    SELECT
        NEWS_UID
        , TOPIC_UID
        , TITLE
        , DATE
        , ROW_NUMBER() OVER (PARTITION BY TOPIC_UID, DATE ORDER BY REGISTRATION_DATE ASC) - 1 AS IDX
    FROM 
        NEWS
    )

-- name: selectNewsList-REMOVED
WITH RECURSIVE
    NUMBERS(N) AS (
        SELECT 1
        UNION ALL
        SELECT N + 1
        FROM NUMBERS
        WHERE N < 100
    )
    , TOPIC_DATE_COUNTS AS (
        SELECT
            TOPIC_UID
            , DATE
            , COUNT(*) AS CNT
        FROM NEWS
        GROUP BY TOPIC_UID, DATE
    )
    , MAX_DATE_COUNTS AS (
        SELECT
            DATE
            , MAX(CNT) AS MAX_CNT
        FROM TOPIC_DATE_COUNTS
        GROUP BY DATE
    )
    , ALL_TOPIC_DATES AS (
        SELECT DISTINCT
            T.TOPIC_UID
            , D.DATE
        FROM (SELECT DISTINCT TOPIC_UID FROM NEWS) T
        CROSS JOIN (SELECT DISTINCT DATE FROM NEWS) D
    )
    , NEWS_WITH_ROWNUM AS (
        SELECT
            NEWS_UID
            , TOPIC_UID
            , DATE
            , TITLE
            , ROW_NUMBER() OVER (
                PARTITION BY TOPIC_UID, DATE
                ORDER BY REGISTRATION_DATE ASC
            ) AS RN
        FROM NEWS
    )
    , EXPANDED AS (
        SELECT
            A.TOPIC_UID
            , A.DATE
            , N.N AS IDX
            , IFNULL(TDC.CNT, 0) AS CNT
            , MDC.MAX_CNT
        FROM ALL_TOPIC_DATES A
        JOIN MAX_DATE_COUNTS MDC
        ON A.DATE = MDC.DATE
        LEFT JOIN TOPIC_DATE_COUNTS TDC
        ON A.TOPIC_UID = TDC.TOPIC_UID
        AND A.DATE = TDC.DATE
        JOIN NUMBERS N
        ON N.N <= MDC.MAX_CNT
    )
SELECT
    NWR.NEWS_UID
  , E.TOPIC_UID
  , NWR.TITLE
  , SUBSTR(E.DATE, 3, 2) || '. ' || SUBSTR(E.DATE, 6, 2) || '. ' || SUBSTR(E.DATE, 9, 2) AS DATE
  , CASE
        WHEN E.IDX <= E.CNT THEN '뉴스존재'
        ELSE '빈뉴스'
    END AS NEWS_STATUS
FROM 
    EXPANDED E
    LEFT JOIN NEWS_WITH_ROWNUM NWR
    ON 
        E.TOPIC_UID = NWR.TOPIC_UID
        AND E.DATE = NWR.DATE
        AND E.IDX = NWR.RN
    ORDER BY
        E.DATE
        , E.TOPIC_UID
        , E.IDX;

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