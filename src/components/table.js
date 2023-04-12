import React from 'react';

const CheekyTable = ({ headers, data }) => {
  const rows = React.useMemo(() => {
    return data.map((row) => {
      return headers.map((header) => {
        return row[header] !== undefined ? row[header] : '-';
      });
    });
  }, [headers, data]);

  const titleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const titleCaseHeaders = headers.map((header) => {
    return titleCase(header).replaceAll("_", " ");
  });

  return (
    <table>
      <thead>
      <tr>
        {titleCaseHeaders.map((header) => (
          <th key={header}>{header}</th>
        ))}
      </tr>
      </thead>
      <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td key={`${i}-${j}`}>{cell}</td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default CheekyTable;
