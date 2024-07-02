var TWO_PI = 2 * Math.PI;
var defaultAmplitude = 1.0;
var defaultFrequency = 1.0;
var defaultOctaves = 1;
var defaultPersistence = 0.5;
export function makeCuboid(width, height, depth, noise3, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.amplitude, amplitude = _c === void 0 ? defaultAmplitude : _c, _d = _b.frequency, frequency = _d === void 0 ? defaultFrequency : _d, _e = _b.octaves, octaves = _e === void 0 ? defaultOctaves : _e, _f = _b.persistence, persistence = _f === void 0 ? defaultPersistence : _f, scale = _b.scale;
    var field = new Array(width);
    for (var x = 0; x < width; x++) {
        field[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            field[x][y] = new Array(depth);
            for (var z = 0; z < depth; z++) {
                var value = 0.0;
                for (var octave = 0; octave < octaves; octave++) {
                    var freq = frequency * Math.pow(2, octave);
                    value += noise3(x * freq, y * freq, z * freq) *
                        (amplitude * Math.pow(persistence, octave));
                }
                field[x][y][z] = value / (2 - 1 / Math.pow(2, octaves - 1));
                if (scale)
                    field[x][y][z] = scale(field[x][y][z]);
            }
        }
    }
    return field;
}
export function makeCylinderSurface(circumference, height, noise3, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.amplitude, amplitude = _c === void 0 ? defaultAmplitude : _c, _d = _b.frequency, frequency = _d === void 0 ? defaultFrequency : _d, _e = _b.octaves, octaves = _e === void 0 ? defaultOctaves : _e, _f = _b.persistence, persistence = _f === void 0 ? defaultPersistence : _f, scale = _b.scale;
    var radius = circumference / TWO_PI;
    var field = new Array(circumference);
    for (var x = 0; x < circumference; x++) {
        field[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            var value = 0.0;
            for (var octave = 0; octave < octaves; octave++) {
                var freq = frequency * Math.pow(2, octave);
                var nx = x / circumference;
                var rdx = nx * TWO_PI;
                var _g = [radius * Math.sin(rdx), radius * Math.cos(rdx)], a = _g[0], b = _g[1];
                value += noise3(a * freq, b * freq, y * freq) *
                    (amplitude * Math.pow(persistence, octave));
            }
            field[x][y] = value / (2 - 1 / Math.pow(2, octaves - 1));
            if (scale)
                field[x][y] = scale(field[x][y]);
        }
    }
    return field;
}
export function makeLine(length, noise1, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.amplitude, amplitude = _c === void 0 ? defaultAmplitude : _c, _d = _b.frequency, frequency = _d === void 0 ? defaultFrequency : _d, _e = _b.octaves, octaves = _e === void 0 ? defaultOctaves : _e, _f = _b.persistence, persistence = _f === void 0 ? defaultPersistence : _f, scale = _b.scale;
    var field = new Array(length);
    for (var x = 0; x < length; x++) {
        var value = 0.0;
        for (var octave = 0; octave < octaves; octave++) {
            var freq = frequency * Math.pow(2, octaves);
            value += noise1(x * freq) * (amplitude * Math.pow(persistence, octave));
        }
        field[x] = value / (2 - 1 / Math.pow(2, octaves - 1));
        if (scale)
            field[x] = scale(field[x]);
    }
    return field;
}
export function makeRectangle(width, height, noise2, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.amplitude, amplitude = _c === void 0 ? defaultAmplitude : _c, _d = _b.frequency, frequency = _d === void 0 ? defaultFrequency : _d, _e = _b.octaves, octaves = _e === void 0 ? defaultOctaves : _e, _f = _b.persistence, persistence = _f === void 0 ? defaultPersistence : _f, scale = _b.scale;
    var field = new Array(width);
    for (var x = 0; x < width; x++) {
        field[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            var value = 0.0;
            for (var octave = 0; octave < octaves; octave++) {
                var freq = frequency * Math.pow(2, octave);
                value += noise2(x * freq, y * freq) *
                    (amplitude * Math.pow(persistence, octave));
            }
            field[x][y] = value / (2 - 1 / Math.pow(2, octaves - 1));
            if (scale)
                field[x][y] = scale(field[x][y]);
        }
    }
    return field;
}
export function makeSphereSurface(circumference, noise3, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.amplitude, amplitude = _c === void 0 ? defaultAmplitude : _c, _d = _b.frequency, frequency = _d === void 0 ? defaultFrequency : _d, _e = _b.octaves, octaves = _e === void 0 ? defaultOctaves : _e, _f = _b.persistence, persistence = _f === void 0 ? defaultPersistence : _f, scale = _b.scale;
    var field = new Array(circumference);
    for (var x = 0; x < circumference; x++) {
        var circumferenceSemi = circumference / 2;
        field[x] = new Array(circumferenceSemi);
        for (var y = 0; y < circumferenceSemi; y++) {
            var _g = [x / circumference, y / circumferenceSemi], nx = _g[0], ny = _g[1];
            var _h = [nx * TWO_PI, ny * Math.PI], rdx = _h[0], rdy = _h[1];
            var sinY = Math.sin(rdy + Math.PI);
            var a = TWO_PI * Math.sin(rdx) * sinY;
            var b = TWO_PI * Math.cos(rdx) * sinY;
            var d = TWO_PI * Math.cos(rdy);
            var value = 0.0;
            for (var octave = 0; octave < octaves; octave++) {
                var freq = frequency * Math.pow(2, octave);
                value += noise3(a * freq, b * freq, d * freq) *
                    (amplitude * Math.pow(persistence, octave));
            }
            field[x][y] = value / (2 - 1 / Math.pow(2, octaves - 1));
            if (scale)
                field[x][y] = scale(field[x][y]);
        }
    }
    return field;
}