-- name: selectTopic
SELECT
    TOPIC_UID
    , TOPIC_NAME
    , REGISTRATION_DATE
    , REGISTRATION_USER
    , FLAG_DELETED
FROM
    TOPIC
WHERE
    FLAG_DELETED = 'N'
ORDER BY
    REGISTRATION_DATE DESC;

-- name: insertTopic
INSERT INTO TOPIC (
    TOPIC_UID,
    TOPIC_NAME,
    REGISTRATION_DATE,
    REGISTRATION_USER,
    FLAG_DELETED
) VALUES (
    :topic_uid
    , :topic_name
    , :registration_date
    , :registration_user
    , 'N'
);

-- name: insertNewTopicIntoInterest
INSERT INTO INTEREST (
    USER_UID
    , TOPIC_UID
    , "ORDER"
) VALUES (
    :user_uid
    , :topic_uid
    , 0
);

-- name: updateTopic
UPDATE TOPIC
SET
    TOPIC_NAME = :topic_name
WHERE
    TOPIC_UID = :topic_uid;

-- name: deleteTopic
UPDATE TOPIC
SET
    FLAG_DELETED = 'Y'
WHERE
    TOPIC_UID = :topic_uid;