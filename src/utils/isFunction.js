export default function(candidate) {
    const result = !!(candidate && candidate.constructor && candidate.call && candidate.apply);
    return result;
}