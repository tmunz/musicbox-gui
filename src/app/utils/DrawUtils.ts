import { Point2 } from "./Point";

export function distance(a: Point2, b: Point2): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function smooth(pnts: Point2[], smoothness: number): Point2[] {
  return pnts.reduce((smoothedPnts, pnt, i, arr) => {
    let prevX = 0;
    let prevY = 0;
    let nextX = 0;
    let nextY = 0;

    // performance reasons, although should work as expected for smoothness == 0
    if (0 < smoothness) {
      const n = arr.length - 1;
      const correctionFactor = n === 1 ? 1 : ((2 / 3) * Math.tan(Math.PI / 2 / n)) / Math.sin(Math.PI / n);

      const pntPrev = arr[(i === 0 ? arr.length - 1 : i) - 1];
      const pntNext = arr[(i === arr.length - 1 ? 0 : i) + 1];

      const dX = pntNext.x - pntPrev.x;
      const dY = pntNext.y - pntPrev.y;
      let rads = Math.atan2(dY, dX);

      const dPrev = smoothness * correctionFactor * distance(pnt, pntPrev);
      const dNext = smoothness * correctionFactor * distance(pnt, pntNext);

      if (arr.length === 3 && i === 1) {
        rads = rads + Math.PI;
      }

      prevX = dPrev * Math.cos(rads + Math.PI);
      prevY = dPrev * Math.sin(rads + Math.PI);
      nextX = dNext * Math.cos(rads);
      nextY = dNext * Math.sin(rads);
    }

    return [
      ...smoothedPnts,
      { x: pnt.x + prevX, y: pnt.y + prevY },
      pnt,
      { x: pnt.x + nextX, y: pnt.y + nextY },
    ];
  }, [] as Point2[]);
}

export function drawBezierCurve(points: (Point2 | undefined)[], style: string): string {
  const pnts = [undefined, ...points.slice(1, -1)];	
  return `<path ${style} d="${pnts
    .reduce((sArr, pnt, i) => {
      if (typeof pnt === 'undefined') {
        if (['M', 'C'].indexOf(sArr[sArr.length - 1]) < 0) {
          return [...sArr, 'M'];
        } else {
          return sArr;
        }
      } else {
        const rtn = [...sArr];
        if (i % 3 === 2) {
          rtn.push('C');
        }
        rtn.push(`${pnt.x},${pnt.y}`);
        return rtn;
      }
    }, [] as string[])
    .join(' ')}" />`;
}