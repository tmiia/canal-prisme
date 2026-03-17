import listData from "../../data/listData.js";
import artTexturesData from "../../data/artTexturesData.js";
import talksTexturesData from "../../data/talksTexturesData.js";

const listSources = listData.map((item) => ({
  name: `galleryTexture${item.id}`,
  type: "texture",
  path: item.image,
}));

const artSources = artTexturesData.map((item) => ({
  name: `artTexture${item.id}`,
  type: "texture",
  path: item.image,
}));

const talksSources = talksTexturesData.map((item) => ({
  name: `talksTexture${item.id}`,
  type: "texture",
  path: item.image,
}));

export default [...listSources, ...artSources, ...talksSources];