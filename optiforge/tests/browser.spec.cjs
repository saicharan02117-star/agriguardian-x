const{test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>page.goto('/optiforge/'));
test('opens diagnosis workspace',async({page})=>{await expect(page.getByRole('heading',{name:/See the symptom/})).toBeVisible();await expect(page.getByRole('button',{name:'Run visual screening'})).toBeDisabled()});
test('field records empty state',async({page})=>{await page.getByRole('button',{name:'Field records'}).click();await expect(page.getByText('No inspections saved yet')).toBeVisible()});
test('model evidence describes limits',async({page})=>{await page.getByRole('button',{name:'Model evidence'}).click();await expect(page.getByText(/confidence score measures model certainty/i)).toBeVisible()});
