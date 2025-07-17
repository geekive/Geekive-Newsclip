-- name: selectNews
SELECT * FROM NEWS WHERE FLAG_DELETED = 'N';

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

-- name: insertUrl
INSERT INTO URL (
     URL_UID
   , NEWS_UID
   , URL
   , TITLE
   , THUMBNAIL_URL
   , REGISTRATION_DATE
   , REGISTRATION_USER
) VALUES (
     :url_uid
   , :news_uid
   , :url
   , :title
   , :thumbnail_url
   , :registration_date
   , :registration_user
);