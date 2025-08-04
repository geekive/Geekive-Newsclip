-- name: selectNotification
SELECT
    NTF_UID           AS ntf_uid
  , USER_UID          AS user_uid
  , TYPE              AS type
  , TARGET_UID        AS target_uid
  , REGISTRATION_DATE AS registration_date
  , REGISTRATION_USER AS registration_user
  , FLAG_READ         AS flag_read
  , FLAG_DELETED      AS flag_deleted
FROM 
  NOTIFICATION
WHERE
  USER_UID = :user_uid;

-- name: insertNotification
INSERT INTO NOTIFICATION (
    NTF_UID
  , USER_UID
  , TYPE
  , TARGET_UID
  , REGISTRATION_DATE
  , REGISTRATION_USER
) VALUES (
    :ntf_uid
  , __USER__
  , :type
  , :target_uid
  , :registration_date
  , :registration_user
);