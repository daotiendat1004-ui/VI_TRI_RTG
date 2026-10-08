const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let switches = [
    { id: 'sw_1', name: 'Đèn Cầu Thang Tầng 1', isOn: false, labelOff: 'Tắt / Xuống', labelOn: 'Bật / Lên' },
    { id: 'sw_2', name: 'Đèn Cầu Thang Tầng 2', isOn: false, labelOff: 'Tắt / Xuống', labelOn: 'Bật / Lên' },
    { id: 'sw_3', name: 'Đèn Hành Lang', isOn: true, labelOff: 'Tắt', labelOn: 'Bật' }
];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.emit('init', switches);

    socket.on('toggle', (data) => {
        const sw = switches.find(s => s.id === data.id);
        if (sw) {
            sw.isOn = data.isOn;
            io.emit('updateToggle', { id: sw.id, isOn: sw.isOn });
        }
    });

    socket.on('updateSwitch', (data) => {
        const sw = switches.find(s => s.id === data.id);
        if (sw) {
            sw.name = data.name;
            sw.labelOff = data.labelOff;
            sw.labelOn = data.labelOn;
            io.emit('updateAll', switches);
        }
    });

    socket.on('addSwitch', () => {
        const newId = 'sw_' + Date.now();
        switches.push({
            id: newId,
            name: `Công tắc mới ${switches.length + 1}`,
            isOn: false,
            labelOff: 'Tắt',
            labelOn: 'Bật'
        });
        io.emit('updateAll', switches);
    });

    socket.on('deleteSwitch', (id) => {
        switches = switches.filter(s => s.id !== id);
        io.emit('updateAll', switches);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
