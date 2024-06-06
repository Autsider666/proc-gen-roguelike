import {PatternData} from "./PatternSchema.ts";
import {Pattern} from "./Pattern.ts";
import {Random, Vector} from "excalibur";

const PatternMap = {
    "101": "101",
    "Block": "block",
    "Glider": "glider",
    "Test": "2.3.3",
    "Backrake1": "backrake1-no.hwss-puffer",
    "Pulsar": "pulsar",
    "HoneyThieves": "honeythieves"
} as const;

export type PatternIdentifier = keyof typeof PatternMap;
// type Values = typeof PatternMap[Keys];

const random = new Random();

export class PatternLoader {
    private static patternCache = new Map<PatternIdentifier, Pattern>();

    static get(name: PatternIdentifier): Pattern {
        const pattern = PatternLoader.patternCache.get(name);
        if (pattern === undefined) {
            throw new Error('Patterns aren\'t loaded correctly');
        }
        return pattern;
    }

    static getRandom(): Pattern {
        const pattern = PatternLoader.patternCache.get(random.pickOne(Object.keys(PatternMap)) as PatternIdentifier);
        if (pattern === undefined) {
            throw new Error('Patterns aren\'t loaded correctly');
        }

        return pattern;
    }

    static async load(): Promise<void> {
        for (const [key, value] of Object.entries(PatternMap)) {
            const data = await import(`../../../public/assets/json/${value}.json`) satisfies PatternData;

            const pattern = Pattern.fromJSON(data);
            PatternLoader.patternCache.set(key as PatternIdentifier, pattern);

            console.log('Loaded Pattern:', key);
        }
    }

    static getTester():Pattern {
        return new Pattern([new Vector(-1,0),new Vector(0,0),new Vector(1,0),])
    }
}