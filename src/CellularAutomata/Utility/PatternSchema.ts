export enum PatternType {
    Oscillator = "oscillator",
}

type VectorData = {
    x: number,
    y: number,
}

export type PatternData = {
    type?:string,
    period?: number,
    bounds: {
        left: number,
        right: number,
        top: number,
        bottom: number,
    },
    points: VectorData[],
    outerBounds?: VectorData[],
    velocity?: VectorData,
}

