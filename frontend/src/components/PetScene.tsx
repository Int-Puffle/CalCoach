import PetCreature from './PetCreature';
import { BACKGROUNDS, FURNITURE } from './PetSceneAssets';

type PetSceneProps = {
  mood: string;
  reaction?: 'good' | 'neutral' | 'bad' | null;
  background: string;
  furniture: string[];
};

function PetScene({ mood, reaction, background, furniture }: PetSceneProps) {
  const bg = BACKGROUNDS[background] || BACKGROUNDS.meadow;

  return (
    <div className="pet-scene">
      <svg viewBox="0 0 200 220" className="pet-scene-background" aria-hidden="true">
        {bg.render()}
      </svg>
      <svg viewBox="0 0 200 220" className="pet-scene-furniture" aria-hidden="true">
        {furniture.map((id) => {
          const item = FURNITURE[id];
          return item ? <g key={id}>{item.render()}</g> : null;
        })}
      </svg>
      <PetCreature mood={mood} reaction={reaction} />
    </div>
  );
}

export default PetScene;
