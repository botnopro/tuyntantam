CREATE TYPE "public"."content_source" AS ENUM('import', 'admin');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'IN_PROGRESS', 'DONE', 'SPAM');--> statement-breakpoint
CREATE TYPE "public"."lead_type" AS ENUM('CONTACT', 'VIEWING', 'PROPERTY_INQUIRY', 'CONSIGNMENT');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('RENT', 'SALE');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'EDITOR');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_slug" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "lead_type" DEFAULT 'CONTACT' NOT NULL,
	"status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"message" text,
	"interest" text,
	"property_id" uuid,
	"preferred_date" date,
	"preferred_time" text,
	"tour_type" text,
	"details" jsonb,
	"source_page" text,
	"ip_hash" text,
	"user_agent" text,
	"admin_note" text,
	"handled_at" timestamp with time zone,
	"handled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content_html" text DEFAULT '' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_placeholder" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"source" "content_source" DEFAULT 'admin' NOT NULL,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"post_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "post_categories_post_id_category_id_pk" PRIMARY KEY("post_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content_html" text DEFAULT '' NOT NULL,
	"cover_image" jsonb,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"author_name" text,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"source" "content_source" DEFAULT 'admin' NOT NULL,
	"source_url" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"property_type" text NOT NULL,
	"price" bigint,
	"price_note" text,
	"area" numeric(10, 2),
	"bedrooms" integer,
	"bathrooms" integer,
	"floors" integer,
	"direction" text,
	"furnishing" text,
	"address" text,
	"ward" text,
	"district" text,
	"city" text DEFAULT 'Hà Nội' NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"summary" text,
	"description_html" text,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video_youtube_id" text,
	"virtual_tour_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"source" "content_source" DEFAULT 'admin' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content_html" text DEFAULT '' NOT NULL,
	"image" jsonb,
	"icon" text,
	"is_placeholder" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source" "content_source" DEFAULT 'admin' NOT NULL,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'EDITOR' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "properties_filter_idx" ON "properties" USING btree ("listing_type","property_type","district");--> statement-breakpoint
CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");