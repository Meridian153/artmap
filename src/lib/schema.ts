// Drizzle ORM 스키마 정의 — ERD.sql 기반
// 테이블, ENUM, 인덱스, 관계(relations)를 모두 이 파일에서 관리합니다.

import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUM 타입 ────────────────────────────────────────────────────────────────

/** 작품 전시 상태 */
export const artworkStatusEnum = pgEnum("artwork_status", [
  "on_display",
  "in_storage",
  "on_loan",
  "under_restoration",
]);

/** 작품 위치 유형 */
export const locationTypeEnum = pgEnum("location_type", [
  "permanent_exhibition",
  "special_exhibition",
  "storage",
  "transit",
]);

/** 소장 기관 유형 */
export const institutionTypeEnum = pgEnum("institution_type", [
  "museum",
  "gallery",
  "private_collection",
  "foundation",
]);

// ─── 테이블 정의 ──────────────────────────────────────────────────────────────

/** 미술 사조 */
export const artMovements = pgTable("art_movements", {
  id: uuid("id").primaryKey(),
  name_en: varchar("name_en"),
  name_ko: varchar("name_ko"),
  period_start: integer("period_start"),
  period_end: integer("period_end"),
  description: text("description"),
});

/** 화가 */
export const artists = pgTable("artists", {
  id: uuid("id").primaryKey(),
  name_en: varchar("name_en"),
  name_ko: varchar("name_ko"),
  birth_year: integer("birth_year"),
  death_year: integer("death_year"),
  nationality: varchar("nationality"),
  bio_en: text("bio_en"),
  bio_ko: text("bio_ko"),
  thumbnail_url: varchar("thumbnail_url"),
  wikidata_id: varchar("wikidata_id"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

/** 화가-사조 연결 (다대다) */
export const artistMovements = pgTable(
  "artist_movements",
  {
    artist_id: uuid("artist_id")
      .notNull()
      .references(() => artists.id),
    movement_id: uuid("movement_id")
      .notNull()
      .references(() => artMovements.id),
  },
  (t) => [primaryKey({ columns: [t.artist_id, t.movement_id] })],
);

/** 소장 기관 (미술관, 갤러리 등) */
export const institutions = pgTable("institutions", {
  id: uuid("id").primaryKey(),
  institution_type: institutionTypeEnum("institution_type"),
  country_code: varchar("country_code"),
  name_en: varchar("name_en"),
  name_ko: varchar("name_ko"),
  website: varchar("website"),
  description_en: text("description_en"),
  description_ko: text("description_ko"),
  wikidata_id: varchar("wikidata_id"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

/** 물리적 장소 (기관에 속한 건물/전시공간) */
export const places = pgTable(
  "places",
  {
    id: uuid("id").primaryKey(),
    institution_id: uuid("institution_id").references(() => institutions.id),
    name_en: varchar("name_en"),
    name_ko: varchar("name_ko"),
    country: varchar("country"),
    city: varchar("city"),
    address: text("address"),
    latitude: decimal("latitude"),
    longitude: decimal("longitude"),
    opening_hours: jsonb("opening_hours"),
    admission: jsonb("admission"),
    created_at: timestamp("created_at"),
    updated_at: timestamp("updated_at"),
  },
  (t) => [index("places_lat_lon_idx").on(t.latitude, t.longitude)],
);

/** 작품 */
export const artworks = pgTable("artworks", {
  id: uuid("id").primaryKey(),
  title_en: varchar("title_en"),
  title_ko: varchar("title_ko"),
  year_created: integer("year_created"),
  year_end: integer("year_end"),
  medium_en: varchar("medium_en"),
  medium_ko: varchar("medium_ko"),
  dimensions: varchar("dimensions"),
  image_url: varchar("image_url"),
  image_source: varchar("image_source"),
  status: artworkStatusEnum("status"),
  curation_en: text("curation_en"),
  curation_ko: text("curation_ko"),
  source_api: varchar("source_api"),
  source_id: varchar("source_id"),
  is_public_domain: boolean("is_public_domain"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

/** 작품-화가 연결 (다대다) */
export const artworkArtists = pgTable(
  "artwork_artists",
  {
    artwork_id: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    artist_id: uuid("artist_id")
      .notNull()
      .references(() => artists.id),
  },
  (t) => [
    primaryKey({ columns: [t.artwork_id, t.artist_id] }),
    index("artwork_artists_artist_id_idx").on(t.artist_id),
  ],
);

/** 작품 소유권 (기관별 소유 지분) */
export const artworkOwnerships = pgTable(
  "artwork_ownerships",
  {
    artwork_id: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    institution_id: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    ownership_share: decimal("ownership_share"),
    is_primary_owner: boolean("is_primary_owner"),
  },
  (t) => [primaryKey({ columns: [t.artwork_id, t.institution_id] })],
);

/** 작품 위치 이력 (전시·보관·이동) */
export const artworkLocations = pgTable(
  "artwork_locations",
  {
    id: uuid("id").primaryKey(),
    artwork_id: uuid("artwork_id").references(() => artworks.id),
    place_id: uuid("place_id").references(() => places.id),
    location_type: locationTypeEnum("location_type"),
    start_date: date("start_date"),
    end_date: date("end_date"),
    source: varchar("source"),
    notes: text("notes"),
  },
  (t) => [index("artwork_locations_place_id_idx").on(t.place_id)],
);

// ─── 관계 정의 (Drizzle relations API) ───────────────────────────────────────

export const artistsRelations = relations(artists, ({ many }) => ({
  artworkArtists: many(artworkArtists),
  artistMovements: many(artistMovements),
}));

export const artMovementsRelations = relations(artMovements, ({ many }) => ({
  artistMovements: many(artistMovements),
}));

export const artistMovementsRelations = relations(artistMovements, ({ one }) => ({
  artist: one(artists, { fields: [artistMovements.artist_id], references: [artists.id] }),
  movement: one(artMovements, {
    fields: [artistMovements.movement_id],
    references: [artMovements.id],
  }),
}));

export const institutionsRelations = relations(institutions, ({ many }) => ({
  places: many(places),
  artworkOwnerships: many(artworkOwnerships),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [places.institution_id],
    references: [institutions.id],
  }),
  artworkLocations: many(artworkLocations),
}));

export const artworksRelations = relations(artworks, ({ many }) => ({
  artworkArtists: many(artworkArtists),
  artworkOwnerships: many(artworkOwnerships),
  artworkLocations: many(artworkLocations),
}));

export const artworkArtistsRelations = relations(artworkArtists, ({ one }) => ({
  artwork: one(artworks, { fields: [artworkArtists.artwork_id], references: [artworks.id] }),
  artist: one(artists, { fields: [artworkArtists.artist_id], references: [artists.id] }),
}));

export const artworkOwnershipsRelations = relations(artworkOwnerships, ({ one }) => ({
  artwork: one(artworks, { fields: [artworkOwnerships.artwork_id], references: [artworks.id] }),
  institution: one(institutions, {
    fields: [artworkOwnerships.institution_id],
    references: [institutions.id],
  }),
}));

export const artworkLocationsRelations = relations(artworkLocations, ({ one }) => ({
  artwork: one(artworks, { fields: [artworkLocations.artwork_id], references: [artworks.id] }),
  place: one(places, { fields: [artworkLocations.place_id], references: [places.id] }),
}));
