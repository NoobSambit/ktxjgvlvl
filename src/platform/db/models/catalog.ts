import { Schema, model, models } from "mongoose"

const catalogTrackSchema = new Schema(
  {
    spotifyId: { type: String, required: true, unique: true, index: true },
    youtubeId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: Number, required: true },
    popularity: { type: Number },
    isBTSFamily: { type: Boolean, default: false, index: true },
    releaseDate: { type: Date },
    genres: { type: [String], default: [] },
    audioFeatures: {
      danceability: { type: Number },
      energy: { type: Number },
      valence: { type: Number },
      tempo: { type: Number },
      acousticness: { type: Number },
      instrumentalness: { type: Number },
      liveness: { type: Number },
      speechiness: { type: Number }
    },
    thumbnails: {
      small: { type: String },
      medium: { type: String },
      large: { type: String }
    },
    previewUrl: { type: String },
    isExplicit: { type: Boolean, default: false }
  },
  {
    collection: "tracks",
    timestamps: true
  }
)

catalogTrackSchema.index({ name: "text", artist: "text", album: "text" })

const catalogAlbumSchema = new Schema(
  {
    spotifyId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    isBTSFamily: { type: Boolean, default: false, index: true },
    tracks: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            artist: { type: String, required: true },
            spotifyId: { type: String, required: true }
          },
          { _id: false }
        )
      ],
      default: []
    },
    trackCount: { type: Number, required: true },
    releaseDate: { type: Date },
    coverImage: { type: String }
  },
  {
    collection: "albums",
    timestamps: true
  }
)

catalogAlbumSchema.index({ name: 1, artist: 1 })
catalogAlbumSchema.index({ isBTSFamily: 1, trackCount: 1 })

export const CatalogTrackModel =
  models.CatalogTrack || model("CatalogTrack", catalogTrackSchema)
export const CatalogAlbumModel =
  models.CatalogAlbum || model("CatalogAlbum", catalogAlbumSchema)
