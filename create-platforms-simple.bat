@echo off
REM create-platforms.bat - Creates lib/platforms directory and TypeScript platform modules

echo Creating lib\platforms directory...
if not exist lib\platforms mkdir lib\platforms

echo.
echo Writing platform modules...
echo.

REM Create Instagram module
echo Creating instagram.ts...
> lib\platforms\instagram.ts (
echo // lib/platforms/instagram.ts
echo // Instagram Graph API publishing helpers
echo.
echo export type InstagramConfig = {
echo   accountId: string;
echo   accessToken: string;
echo };
echo.
echo export async function publishImage^(
echo   config: InstagramConfig,
echo   imageUrl: string,
echo   caption: string
echo ^): Promise^<{ containerId: string; publishedId: string }^> {
echo   const { accountId, accessToken } = config;
echo.
echo   const createRes = await fetch^(
echo     `https://graph.facebook.com/v17.0/${accountId}/media`,
echo     {
echo       method: "POST",
echo       body: new URLSearchParams^({
echo         image_url: imageUrl,
echo         caption,
echo         access_token: accessToken,
echo       }^),
echo     }
echo   ^);
echo.
echo   const createData = await createRes.json^(^);
echo   if ^(!createData.id^) {
echo     throw new Error^(`Failed to create Instagram media: ${JSON.stringify^(createData^)}`^);
echo   }
echo.
echo   const publishRes = await fetch^(
echo     `https://graph.facebook.com/v17.0/${accountId}/media_publish`,
echo     {
echo       method: "POST",
echo       body: new URLSearchParams^({
echo         creation_id: createData.id,
echo         access_token: accessToken,
echo       }^),
echo     }
echo   ^);
echo.
echo   const publishData = await publishRes.json^(^);
echo   if ^(!publishData.id^) {
echo     throw new Error^(`Failed to publish Instagram media: ${JSON.stringify^(publishData^)}`^);
echo   }
echo.
echo   return { containerId: createData.id, publishedId: publishData.id };
echo }
)

echo Done!
echo.
echo Platform modules created in lib\platforms\
echo.
echo Next: Run npm install googleapis @supabase/supabase-js @netlify/functions
pause
