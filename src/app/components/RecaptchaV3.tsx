import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type Props = {
  siteKey: string;
  useEnterprise?: boolean;
  action: string;
  onToken: (token: string) => void;
};

export const RecaptchaV3 = ({ siteKey, useEnterprise = false, action, onToken }: Props) => {
  const html = useMemo(() => {
    const scriptSrc = useEnterprise
      ? `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`
      : `https://www.google.com/recaptcha/api.js?render=${siteKey}`;

    const executeFn = useEnterprise ? 'grecaptcha.enterprise.execute' : 'grecaptcha.execute';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="${scriptSrc}"></script>
          <script>
            function sendToken(token) {
              window.ReactNativeWebView.postMessage(token);
            }
            function executeRecaptcha() {
              if (typeof grecaptcha === 'undefined') {
                setTimeout(executeRecaptcha, 500);
                return;
              }
              grecaptcha.ready(function () {
                ${executeFn}('${siteKey}', { action: '${action}' }).then(sendToken);
              });
            }
            window.onload = executeRecaptcha;
          </script>
        </head>
        <body>
          <div></div>
        </body>
      </html>
    `;
  }, [siteKey, useEnterprise, action]);

  const handleMessage = (event: WebViewMessageEvent) => {
    const token = event.nativeEvent.data;
    if (token) {
      onToken(token);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 1,
    width: 1,
    opacity: 0,
  },
});
