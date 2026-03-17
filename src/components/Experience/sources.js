import listData from "../../data/listData.js";
import artTexturesData from "../../data/artTexturesData.js";

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

export default [...listSources, ...artSources];