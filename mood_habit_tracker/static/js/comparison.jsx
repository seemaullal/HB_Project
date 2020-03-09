class ComparisonForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = { Choices: null,
                       xAxis: 'Drink 20 oz of water',
                       yAxis: 'Motivation',
                       responseData: null,
                       didSubmit: false 
                    };
        
        this.makeXChoices = this.makeXChoices.bind(this);
        this.makeYChoices = this.makeYChoices.bind(this);
        this.updateComparisonForm = this.updateComparisonForm.bind(this);
        this.handleXAxisChange = this.handleXAxisChange.bind(this);
        this.handleYAxisChange = this.handleYAxisChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this); 
        this.handleSubmitResponse = this.handleSubmitResponse.bind(this);
    }

    updateComparisonForm(res) {
        this.setState({ choices: [res.x_choices, res.y_choices] });
    }
    
    getCompareChoices() {
        $.get('/comparison_form.json', this.updateComparisonForm);
    }

    componentDidMount() {
        this.getCompareChoices();
    }

    makeXChoices() {
        const pullDownChoices = []
        for (const choice of this.state.choices[0]) {
            pullDownChoices.push(<option value={choice}>{choice}</option>)
        }
        return pullDownChoices
    }

    makeYChoices() {
        const pullDownChoices = []
        for (const choice of this.state.choices[1]) {
            pullDownChoices.push(<option value={choice}>{choice}</option>)
        }
        return pullDownChoices
    }

    handleSubmitResponse(res) {
        this.setState({ responseData: res });
        this.setState({ didSubmit: true })
    }

    handleSubmit(event) {
        event.preventDefault();
        const data = {xAxis: this.state.xAxis, yAxis: this.state.yAxis}
        $.get('/comparison_chart.json', data, this.handleSubmitResponse);
    }

    handleXAxisChange(event) {
        console.log(event.target.value);
        this.setState({xAxis: event.target.value});
    }

    handleYAxisChange(event) {
        console.log(event.target.value);
        this.setState({yAxis: event.target.value});
    }



    render() {
        if (this.state.choices) {
            return (
                <div class="col-xl-5 col-lg-6 col-md-8 col-sm-10 mx-auto text-center form p-4">
                    <h1>Choose Axis Here</h1>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            X-Axis:
                            <br></br>
                            <select xaxis={this.state.xAxis} onChange={this.handleXAxisChange}>
                                {this.makeXChoices()}
                            </select>
                        </label>
                        <br></br>
                        <label>
                            Y-Axis:
                            <br></br>
                            <select yaxis={this.state.yAxis} onChange={this.handleYAxisChange}>
                                {this.makeYChoices()}
                            </select>
                        </label>
                        <br></br>
                        <input type="submit" value="See Comparison"/>
                    </form>
                    <ComparisonChart responseData={this.state.responseData} didSubmit={this.state.didSubmit}/>
                </div>
            ); 
        }
        return (<div class="spinner-border text-success" role="status">
                    <span class="sr-only">Loading...</span>
                </div>)

    }
}

// ReactDOM.render(<ComparisonForm />, document.getElementById('comparison-form'));

class ComparisonChart extends React.Component {

    constructor(props) {

        super(props);

        this.chartRef = React.createRef();

        this.state = {chart: false};

        this.createChart = this.createChart.bind(this);
        // this.updateChart = this.updateChart.bind(this);
    }
    

    componentDidUpdate(prevProps){
        if (this.chartRef.current !== null && this.state.chart === false){
            this.createChart();
        }
        if (this.state.chart === true){
            this.updateChart();
        }   
    }


    createChart() {
        this.setState({chart: true})
        let ctx = document.getElementById('bar-chart');
        if (ctx) {
            this.barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.props.responseData.labels,
                    datasets: [
                        {
                            label: `Intensity of ${this.props.responseData.y_axis}`,
                            backgroundColor: ['#4ac828', '#5628c8', '#284ac8'],
                            data: this.props.responseData.data
                        }
                    ]
                },
                options: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: `${this.props.responseData.y_axis} Intensity versis ${this.props.responseData.x_axis}`
                    },
                    scales: {
                        yAxes: [{
                          ticks: {
                            min: 0,
                            max: 10
                          }
                        }]
                    }
                }
            });
        }
    }

    updateChart(){
        this.barChart.data.labels = this.props.responseData.labels;
        this.barChart.data.datasets[0].label = `Intensity of ${this.props.responseData.y_axis}`;
        this.barChart.data.datasets[0].data = this.props.responseData.data;
        this.barChart.options.title.text = `${this.props.responseData.y_axis} Intensity versis ${this.props.responseData.x_axis}`;
        this.barChart.update();
    }

    render() { 
        
        return (
            <div>
                <canvas id="bar-chart" ref={this.chartRef} width="800" height="450"/>
            </div>
        );

        
    }
}