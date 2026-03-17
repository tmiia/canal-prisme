import Layer from "@/components/layers";
import DefaultOverlay from "@/components/defaultOverlay";
import List from "@/components/list";
import ScrollTransition from "@/components/scrollTransition";
import SmoothScroll from "@/components/SmoothScroll";
import ThreeJSExperience from "@/components/three/ThreeCanvas";

export default function Home() {
  return (
    <main>
      <SmoothScroll>
        <ThreeJSExperience />
        <Layer />
        <DefaultOverlay />
        <ScrollTransition />
        <List />
      </SmoothScroll>
    </main>
  );
}
