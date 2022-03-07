```
const table = {
    title: undefined,
    headers: [String@Object], // headers must be same number of columns with rows
    datas: [], // datas and rows must exist either one
    rows: [[String]], // row must be same number of columns with headers
    options: {
        columnSpacing: 3
        divider: {
            header: {disabled: false, width: undefined, opacity: undefined},
            horizontal: {disabled: false, width: undefined, opacity: undefined},
            vertical: {disabled: false, width: undefined, opacity: undefined},
            title: ''
        }
        padding: 0,
        x: 0,
        y: 0
    }
}
```

## Headers

headers: [String] @ [Object]
Object {padding: Number@[Number]} [0] @ [0,0] @ [0,0,0] @ [0,0,0,1]
