
var BenchMark = {

    /*record(text){
        let key = "benchrecords";

        if (localStorage.getItem(key) === null){
            localStorage.setItem(key, "Tree Generation:\tRootFounders\tMaxGen\tAlleleSize\tInbreedChance\tNumPeople\tNumInbredCouples\tTimingTreeGen\tTimingRender\n")
        }

        var tttt = localStorage.getItem(key)
        tttt += text;

        localStorage.setItem(key, tttt);
        console.log("logged:", text);
    },*/

    exportData(){
        exportToTab( localStorage.getItem("benchrecords") );
    },

    launch_with_props( rootfounders, maxgen, allelesize, inbreedchance, exportToFile,
        endfunction = function(timetree, numpeople, numinbredcouples, timerender, numrecombs){},
        termfunction= function(){})
    {
        BenchStopwatch.terminate = function(text){
            termfunction(text);
        }


        BenchStopwatch.start();
        var tg = new TreeGenerator(rootfounders, maxgen, allelesize, inbreedchance);
        BenchStopwatch.stop();

        var treetime= BenchStopwatch.getDiff(),
            metrics = tg.printmetrics();

        // Completed in FileFormat_superclass.js
        BenchStopwatch.start(
            function (rendertime) {
                endfunction(treetime, metrics.numpeople, metrics.numinbredcouples, rendertime, metrics.numallelerecombinations);
                utility.notify("Benchmark", 
                    metrics.numpeople+" individuals, " +
                    metrics.numinbredcouples + " inbred couples," +
                    "Render Time=" + (rendertime/1000).toFixed(3) +" s", 5);

            }
        );

        var text = tg.exportToHaploFile();
        if (exportToFile){
            exportToTab( text );
        }
        //BenchStopwatch.terminate(errors);

        new Allegro(null, text);    
    },

    launch_display(){
        benchProps.display(function(rootfounders, maxgen, allelesize, inbreedchance, exportToFile)
        {
            BenchMark.launch_with_props( rootfounders, maxgen, allelesize, inbreedchance, exportToFile);
        });
    }
}