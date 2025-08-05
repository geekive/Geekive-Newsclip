-- name: selectNotification
SELECT
    NTF.NOTIFICATION_UID  AS notification_uid
  , NTF.USER_UID          AS user_uid
  , NTF.TYPE              AS type
  , NTF.TARGET_UID        AS target_uid
  , CASE WHEN NTF.TYPE = 'COMMENT' THEN U.NICKNAME || '님이 [' || NWS.TITLE || ']에 댓글을 달았어요.' ELSE '' END AS message
  , NTF.REGISTRATION_USER AS registration_user
  , NTF.FLAG_READ         AS flag_read
  , NTF.FLAG_DELETED      AS flag_deleted
  , CASE
        WHEN (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) BETWEEN 0 AND 59
            THEN '방금 전'
        WHEN (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) BETWEEN 60 AND 3599
            THEN printf('%d분전',
                        (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) / 60)
        WHEN (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) BETWEEN 3600 AND 86399
            THEN printf('%d시간전',
                        (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) / 3600)
        WHEN (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) >= 86400
            THEN printf('%d일전',
                        (strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)) / 86400)
        WHEN (strftime('%s', NTF.REGISTRATION_DATE) - strftime('%s','now','localtime')) BETWEEN 0 AND 59
            THEN '방금 전'
        ELSE
            printf('%d초후', abs(strftime('%s','now','localtime') - strftime('%s', NTF.REGISTRATION_DATE)))
    END               AS registration_date
FROM 
  NOTIFICATION NTF
  LEFT JOIN USER U
  ON
	  U.USER_UID = NTF.REGISTRATION_USER
  LEFT JOIN NEWS NWS
  ON
	  NWS.NEWS_UID = NTF.TARGET_UID
WHERE
  NTF.USER_UID = :user_uid;

-- name: updateNotificationRead
UPDATE NOTIFICATION
SET
  FLAG_READ = 'Y'
WHERE
  NOTIFICATION_UID = :notification_uid

-- name: insertNotification
INSERT INTO NOTIFICATION (
    NOTIFICATION_UID
  , USER_UID
  , TYPE
  , TARGET_UID
  , REGISTRATION_DATE
  , REGISTRATION_USER
) VALUES (
    :notification_uid
  , :user_uid
  , :type
  , :target_uid
  , :registration_date
  , :registration_user
);

-- name: selectAllUserUid
SELECT
  USER_UID  AS user_uid
FROM
  USER
WHERE
  USER_UID != :user_uid