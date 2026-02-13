import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TrendCharts.css';

function TrendCharts({ charts }) {
  if (!charts || charts.length === 0) {
    return (
      <div className="trend-charts">
        <p className="no-charts">No chart data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLineChart = (chart) => {
    // Convert chart.js format to recharts format
    const data = chart.data.labels.map((label, index) => {
      const point = { name: label };
      chart.data.datasets.forEach(dataset => {
        point[dataset.label] = dataset.data[index];
      });
      return point;
    });

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
          <XAxis dataKey="name" stroke="#8892b0" />
          <YAxis stroke="#8892b0" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {chart.data.datasets.map((dataset, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor}
              strokeWidth={2}
              dot={{ fill: dataset.borderColor, r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = (chart) => {
    // Convert chart.js format to recharts format
    const data = chart.data.labels.map((label, index) => {
      const point = { name: label };
      chart.data.datasets.forEach(dataset => {
        point[dataset.label] = dataset.data[index];
      });
      return point;
    });

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
          <XAxis dataKey="name" stroke="#8892b0" angle={-45} textAnchor="end" height={100} />
          <YAxis stroke="#8892b0" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {chart.data.datasets.map((dataset, index) => (
            <Bar
              key={index}
              dataKey={dataset.label}
              fill={dataset.backgroundColor}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (chart) => {
    // Convert chart.js format to recharts format
    const data = chart.data.labels.map((label, index) => ({
      name: label,
      value: chart.data.datasets[0].data[index]
    }));

    const COLORS = chart.data.datasets[0].backgroundColor || [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = (chart, index) => {
    let chartComponent;

    switch (chart.type) {
      case 'line':
        chartComponent = renderLineChart(chart);
        break;
      case 'bar':
        chartComponent = renderBarChart(chart);
        break;
      case 'pie':
        chartComponent = renderPieChart(chart);
        break;
      default:
        chartComponent = <p className="unsupported-chart">Unsupported chart type: {chart.type}</p>;
    }

    return (
      <div key={index} className="chart-container">
        <h3 className="chart-title">{chart.title}</h3>
        {chartComponent}
      </div>
    );
  };

  return (
    <div className="trend-charts">
      {charts.map((chart, index) => renderChart(chart, index))}
    </div>
  );
}

export default TrendCharts;
