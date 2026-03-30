import Layer from "@/components/layers";
import DefaultOverlay from "@/components/defaultOverlay";
import List from "@/components/list";
import ScrollTransition from "@/components/scrollTransition";
import SmoothScroll from "@/components/SmoothScroll";
import ThreeJSExperience from "@/components/three/ThreeCanvas";
import CursorFollower from "@/components/cursorFollower";

export default function Home() {
  return (
    <main>
      <CursorFollower />
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
