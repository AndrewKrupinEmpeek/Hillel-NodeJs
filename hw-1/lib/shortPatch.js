global.console.short = (...args) => {
  if (args?.length > 2) {
    const arr = args.slice();
    const short = [];
    short.push(arr.shift());
    short.push('...');
    short.push(arr.pop());
    console.log(...short);
  } else {
    console.log(...args);
  }
};
