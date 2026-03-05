import listData from "../../data/listData.js";

export default listData.map((item) => ({
  name: `galleryTexture${item.id}`,
  type: "texture",
  path: item.image,
}));