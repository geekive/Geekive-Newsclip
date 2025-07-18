-- name: selectNews
SELECT * FROM NEWS WHERE FLAG_DELETED = 'N';

-- name: selectNewsDetail
SELECT 
    N.NEWS_UID      AS news_uid
    , T.TOPIC_NAME  AS topic_name
    , N.TITLE       AS title
    , N.DATE        AS date
    , N.MEMO        AS memo
    , N.IMPORTANCE  AS importance
FROM 
    NEWS N
	  INNER JOIN TOPIC T
	  ON
		  T.TOPIC_UID = N.TOPIC_UID
WHERE
	N.NEWS_UID = :news_uid;

-- name: selectArticleList
SELECT
  ARTICLE_UID   AS article_uid
  , URL         AS url
  , PUBLISHER   AS publisher
  , IMAGE_URL   AS image_url
  , TITLE       AS title
  , DESCRIPTION AS description
FROM 
  ARTICLE
WHERE
  FLAG_DELETED = 'N'
  AND NEWS_UID = :news_uid
ORDER BY
  REGISTRATION_DATE DESC

-- name: insertNews
INSERT INTO NEWS (
    NEWS_UID
    , TOPIC_UID
    , TITLE
    , DATE
    , MEMO
    , IMPORTANCE
    , REGISTRATION_DATE
    , REGISTRATION_USER
) VALUES (
    :news_uid
    , :topic_uid
    , :title
    , :date
    , :memo
    , :importance
    , :registration_date
    , :registration_user
);

-- name: insertArticle
INSERT INTO ARTICLE (
     ARTICLE_UID
   , NEWS_UID
   , URL
   , PUBLISHER
   , IMAGE_URL
   , TITLE
   , DESCRIPTION
   , REGISTRATION_DATE
   , REGISTRATION_USER
) VALUES (
     :article_uid
   , :news_uid
   , :url
   , :publisher
   , :image_url
   , :title
   , :description
   , :registration_date
   , :registration_user
);

-- name: updateNews
UPDATE NEWS
SET
  title         = :title
  , DATE        = :date
  , MEMO        = :memo
  , IMPORTANCE  = :importance
  , UPDATE_DATE = :update_date
  , UPDATE_USER = :update_user
WHERE
  NEWS_UID = :news_uid;

-- name: deleteArticle
UPDATE ARTICLE
SET
  FLAG_DELETED = 'Y'
WHERE
  NEWS_UID = :news_uid
  AND ARTICLE_UID NOT IN (__ARTICLE_UID_LIST__)