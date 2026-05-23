// Drizzle ORM 스키마 정의 — ERD.sql 기반
// 테이블, 인덱스, 관계(relations)를 모두 이 파일에서 관리합니다.

import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── 테이블 정의 ──────────────────────────────────────────────────────────────

/** 미술 사조 */
export const artMovements = pgTable("art_movements", {
  id: uuid("id").primaryKey(),
  name_en: varchar("name_en").notNull(),
  name_ko: varchar("name_ko").notNull(),
  period_start: integer("period_start"),
  period_end: integer("period_end"),
  description: text("description"),
});

/** 화가 */
export const artists = pgTable("artists", {
  id: uuid("id").primaryKey(),
  name_en: varchar("name_en").notNull(),
  name_ko: varchar("name_ko").notNull(),
  birth_year: integer("birth_year").notNull(),
  death_year: integer("death_year"),
  nationality: varchar("nationality").notNull(),
  bio_en: text("bio_en").notNull().default(""),
  bio_ko: text("bio_ko").notNull().default(""),
  thumbnail_url: varchar("thumbnail_url").notNull().default(""),
  wikidata_id: varchar("wikidata_id"),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  deleted_at: timestamp("deleted_at"),
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
  institution_type: varchar("institution_type").notNull(),
  country_code: varchar("country_code").notNull(),
  name_en: varchar("name_en").notNull(),
  name_ko: varchar("name_ko").notNull(),
  website: varchar("website"),
  description_en: text("description_en"),
  description_ko: text("description_ko"),
  wikidata_id: varchar("wikidata_id"),
  image_url: varchar("image_url"),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  deleted_at: timestamp("deleted_at"),
});

/** 물리적 장소 (기관에 속한 건물/전시공간) */
export const places = pgTable(
  "places",
  {
    id: uuid("id").primaryKey(),
    institution_id: uuid("institution_id").references(() => institutions.id),
    name_en: varchar("name_en").notNull(),
    name_ko: varchar("name_ko").notNull(),
    country: varchar("country").notNull(),
    city: varchar("city").notNull(),
    address: text("address"),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    opening_hours: jsonb("opening_hours"),
    admission: jsonb("admission"),
    created_at: timestamp("created_at").notNull(),
    updated_at: timestamp("updated_at").notNull(),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [index("ix_places_lat_lng").on(t.latitude, t.longitude)],
);

/** 작품 */
export const artworks = pgTable(
  "artworks",
  {
    id: uuid("id").primaryKey(),
    title_en: varchar("title_en").notNull(),
    title_ko: varchar("title_ko").notNull(),
    year_created: integer("year_created").notNull(),
    year_end: integer("year_end"),
    medium_en: varchar("medium_en").notNull(),
    medium_ko: varchar("medium_ko").notNull(),
    dimensions: varchar("dimensions"),
    image_url: varchar("image_url"),
    image_source: varchar("image_source"),
    status: varchar("status").notNull(),
    curation_en: text("curation_en"),
    curation_ko: text("curation_ko"),
    source_api: varchar("source_api").notNull(),
    source_id: varchar("source_id").notNull(),
    is_public_domain: boolean("is_public_domain").notNull().default(false),
    created_at: timestamp("created_at").notNull(),
    updated_at: timestamp("updated_at").notNull(),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [uniqueIndex("uq_artwork_source").on(t.source_api, t.source_id)],
);

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
    index("ix_artwork_artists_artist_id").on(t.artist_id),
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
    ownership_share: decimal("ownership_share", { precision: 5, scale: 4 }),
    is_primary_owner: boolean("is_primary_owner").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.artwork_id, t.institution_id] }),
    index("ix_artwork_ownerships_institution_id").on(t.institution_id),
  ],
);

/** 작품 위치 이력 (전시·보관·이동) */
export const artworkLocations = pgTable(
  "artwork_locations",
  {
    id: uuid("id").primaryKey(),
    artwork_id: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id),
    location_type: varchar("location_type").notNull(),
    start_date: date("start_date").notNull(),
    end_date: date("end_date"),
    source: varchar("source"),
    notes: text("notes"),
  },
  (t) => [
    index("ix_artwork_locations_place_id").on(t.place_id),
    index("ix_artwork_locations_artwork_id").on(t.artwork_id),
  ],
);

/** 기관 대표 작품 */
export const institutionFeaturedArtworks = pgTable(
  "institution_featured_artworks",
  {
    institution_id: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    artwork_id: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    display_order: integer("display_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.institution_id, t.artwork_id] })],
);

/** 화가 대표 작품 */
export const artistFeaturedArtworks = pgTable(
  "artist_featured_artworks",
  {
    artist_id: uuid("artist_id")
      .notNull()
      .references(() => artists.id),
    artwork_id: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    display_order: integer("display_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.artist_id, t.artwork_id] })],
);

// ─── 관계 정의 (Drizzle relations API) ───────────────────────────────────────

export const artistsRelations = relations(artists, ({ many }) => ({
  artworkArtists: many(artworkArtists),
  artistMovements: many(artistMovements),
  artistFeaturedArtworks: many(artistFeaturedArtworks),
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
  institutionFeaturedArtworks: many(institutionFeaturedArtworks),
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
  institutionFeaturedArtworks: many(institutionFeaturedArtworks),
  artistFeaturedArtworks: many(artistFeaturedArtworks),
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

export const institutionFeaturedArtworksRelations = relations(
  institutionFeaturedArtworks,
  ({ one }) => ({
    institution: one(institutions, {
      fields: [institutionFeaturedArtworks.institution_id],
      references: [institutions.id],
    }),
    artwork: one(artworks, {
      fields: [institutionFeaturedArtworks.artwork_id],
      references: [artworks.id],
    }),
  }),
);

export const artistFeaturedArtworksRelations = relations(artistFeaturedArtworks, ({ one }) => ({
  artist: one(artists, {
    fields: [artistFeaturedArtworks.artist_id],
    references: [artists.id],
  }),
  artwork: one(artworks, {
    fields: [artistFeaturedArtworks.artwork_id],
    references: [artworks.id],
  }),
}));
