const fs=require('node:fs'),csstree=require('css-tree');
const html=fs.readFileSync('index.html','utf8');const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];const ast=csstree.parse(css,{positions:true,onParseError(error){throw error;}});let rules=0;csstree.walk(ast,node=>{if(node.type==='Rule')rules++;});console.log(`CSS parsed: ${rules} rules, 0 syntax errors.`);
