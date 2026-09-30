const{defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests',testMatch:'browser.spec.cjs',use:{baseURL:'http://127.0.0.1:4173',viewport:{width:390,height:844}},webServer:{command:'python3 -m http.server 4173 --directory ..',url:'http://127.0.0.1:4173/optiforge/',reuseExistingServer:true},reporter:'line'});
