<details>
  <summary title="menu"></summary>
  <nav>
    % for name in ['collections', 'favorites', 'find', 'settings']:
      <a href="${name}.html"
        ${'class="current"' if name == current else ''}>
        ${name.capitalize()}
      </a>
    % endfor
  </nav>
</details>
