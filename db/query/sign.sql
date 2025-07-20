-- name: checkNickname
SELECT
	COUNT(*)
FROM 
	USER
WHERE
	UPPER(NICKNAME) = UPPER(:nickname);

-- name: checkEmail
SELECT
	COUNT(*)
FROM 
	USER
WHERE
	UPPER(EMAIL) = UPPER(:email);

-- name: insertUser
INSERT INTO USER(  
	USER_UID
	, NICKNAME
	, EMAIL
	, PASSWORD
	, REGISTRATION_DATE
	, REGISTRATION_USER
) VALUES (  
	:user_uid
	, :nickname
	, :email
	, :password
	, :registration_date
	, :user_uid
);

-- name: selectUser
SELECT
	USER_UID		AS user_uid
	, NICKNAME		AS nickname
	, EMAIL			AS email
	, PASSWORD		AS password
FROM
	USER
WHERE
	EMAIL = :email
