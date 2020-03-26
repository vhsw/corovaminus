import { erf } from 'mathjs';

export default function ([amp, offset, sigma]) {
    let day_ms = 60 * 60 * 24 * 1000;
    return (t) => amp / 2 * (1 + erf((t - offset) / day_ms / (sigma * Math.SQRT2)))
}
