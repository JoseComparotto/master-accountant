const configuration = () => ({
    api: {
        port: parseInt(`${process.env.PORT}`, 10) ?? 3000,
        globalPrefix: process.env.GLOBAL_PREFIX ?? '/api'
    },
    mock:{
        autoSeed: process.env.MOCK_AUTO_SEED === 'true',
        defaultChartId: process.env.DEFAULT_CHART_ID
    }
});

export default configuration;

export type AppConfig = ReturnType<typeof configuration>;