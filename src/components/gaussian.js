export default function ([amp, offset, sigma]) {
    let day_ms = 60 * 60 * 24 * 1000;
    return (t) => amp / Math.sqrt(2 * Math.PI) / sigma * Math.exp(-1 / 2 * Math.pow((t - offset) / day_ms / (sigma), 2))
}
