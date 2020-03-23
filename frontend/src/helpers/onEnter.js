export default function onEnter(callback) {
    return function (e) {
        if (e.key === 'Enter') {
            return callback(e);
        }
    }
} 
