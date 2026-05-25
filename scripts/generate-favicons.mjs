import { favicons } from 'favicons';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const source = readFileSync('./public/favicon.svg');
const dest = './public';

const response = await favicons(source, {
    path: '/',
    appName: 'SynthOmaha',
    appDescription: "Omaha's Electronic Music Community",
    background: '#1e3a52',
    theme_color: '#ff8c96',
    icons: {
        android: true,
        appleIcon: true,
        appleStartup: false,
        favicons: true,
        windows: false,
        yandex: false,
    },
});

for (const image of response.images) {
    writeFileSync(join(dest, image.name), image.contents);
    console.log('wrote', image.name);
}

for (const file of response.files) {
    writeFileSync(join(dest, file.name), file.contents);
    console.log('wrote', file.name);
}

console.log('\nAdd to <head>:');
for (const tag of response.html) {
    console.log(tag);
}
