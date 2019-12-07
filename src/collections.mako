<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ## <link rel="stylesheet" href="${site_css}" />
    <link rel="stylesheet" href="${css}" />
    <title>${name}</title>
  </head>

  <body>
    ## <button id="heart"></button>
    <h1 class="title">Tar Heel Reader - ${name}</h1>
    <div id="body">
      <ul>
        % for book in books:
        <li id="${book['id']}">
          <a href="${book['link']}#p1">
            <h1>${book['title']}</h1>
            <p>${book['author']}</p>
            <img src="${book['image']}" />
          </a>
        </li>
        % endfor
      </ul>
    </div>
  </body>
</html>