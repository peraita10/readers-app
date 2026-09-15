CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE user_books(user_id UUID NOT NULL,book_id TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('WANT_TO_READ','READING','READ')),started_at TIMESTAMPTZ,finished_at TIMESTAMPTZ,updated_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(user_id,book_id));
CREATE TABLE reviews(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),user_id UUID NOT NULL,book_id TEXT NOT NULL,rating NUMERIC(2,1) NOT NULL CHECK(rating BETWEEN 1 AND 5 AND rating*2=TRUNC(rating*2)),text TEXT,spoiler BOOLEAN DEFAULT FALSE,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW(),UNIQUE(user_id,book_id));
CREATE TABLE review_likes(review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,user_id UUID NOT NULL,PRIMARY KEY(review_id,user_id));
CREATE TABLE review_comments(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,user_id UUID NOT NULL,text TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW());
