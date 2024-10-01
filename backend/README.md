# News Forum

### Backend

- Node.js: 16.17.0
- NextJS: 9.1.8

### Migration

- Create: npm run migration:create -- ./src/migrations/CreateUser
- Update: npm run migration:generate -n ./src/migrations/UpdateUser
- Execute: npm run migration:run

### Coding Style

- body: xxxBody
- param: xxxParam
- query: xxxQuery
- function result: xxxResult
- others: xxxDto

### Translator Example

```
{{
    $translator.__("exam.selectWordDifficulty", {
        app: {
        name: "test",
        },
    })
}}
```

### Test

- Single test: `npm run test -- ./src/apis/exchange-rate/service.spec.ts`

```
            // get: jest.fn().mockImplementation((key: string) => {
            //   switch (key) {
            //     case 'EXCHANGE_RATE.PROVIDER_TYPE':
            //       return 'bot';
            //     default:
            //       return null;
            //   }
            // }),
```

# TODOs

- Manager & role permissions.
- Create Git repo for saved last exchange rates (data from crawler & database).
- Display all API status in WEB.
- Get & convert amount exchange rate API.

# AWS

- https://aws.amazon.com/tw/lightsail/pricing/
- https://lightsail.aws.amazon.com/ls/webapp/home/instances

# License

- https://github.com/startbootstrap/startbootstrap-freelancer/blob/master/LICENSE

# Avatar Generator

- https://getavataaars.com/

# FontAwesome

- https://fontawesome.com/icons

  /\*\*

  - @param string $link
  -
  - @return string
    \*/
    private function extractRefFromLink($link)
    {
        $parseLink = parse_url($link);
    if (!isset($parseLink['scheme'], $parseLink['host'], $parseLink['path'])) {
    return '';
    }

        $guid = str_replace('_', '/', str_replace('/rss/articles/', '', $parseLink['path']));
        $decodedGuid = base64_decode($guid, true);
        if (!$decodedGuid) {
            return '';
        }

        $url = trim(urldecode(preg_replace('/^.*?(https?:\/\/[-\w.\/:%\?+#&=@;]+[\w.\/:#&@+;]+).*?$/', '$1', $decodedGuid))) ?? '';
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return '';
        }

        return $url;

    }
