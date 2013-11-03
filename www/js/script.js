Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};
		var con = $(".console");
		var cur_downloads = 0;
		var batch_done = false;
		var chaptersJSON = "";
		var accesscode = "jasper";
		var wattcode ="";
		var errors = 0;
	
		
		$('#btn').click(function(){
		
		try {
			$('.chapters').html("");
			wattcode = ( $('input.wattcode').val());
			if(wattcode ==""){
				return false;
			}
			write("Download Started");
			$('.debug').fadeOut();
			write("<i></i>Getting Chapter List...");
			$.get( "http://w2a.us.to/wat/getchapters.php", { wattcode: wattcode } )
			  .done(function( data ,status) {
				chaptersJSON = data;
				if(status=="success"){
					if(data =="The wattcode is not valid or the page is no longer available.") {
						write("The wattcode is not valid or the page is no longer available.");
							$('.debug').fadeIn();
						return false;
					}
					write( "Response:" + data + "");
					var chapters = $.parseJSON(data);
					var indv_incr = ((1/Object.size(chapters))*100)
					$.each(chapters, function( index, value ) {
						
						 downloadChapter(index,value);
						
					});
				} else {
					alert("Error Fetching Chapters" +status);
				}
				  });
			} catch(Ex){
				write("<b>" +Ex +"</b>");
			}
		});
		function downloadChapter(index,value){
			addDownload('<div class="chapter" id="chap'+value+'">'+index+'<i class="load">Loading..</i></div>');
			$.get( "http://w2a.us.to/wat/getcontent.php", { wattcode: value, accesscode: accesscode} )
				 .done(function( data ) {
					if(data == "ERROR_DOWNLOAD"){
						$('#chap' + value).remove();
						downloadChapter(index,value);
						errors ++;
					} else {
						doneDownload(value);
					}
					cur_downloads--;
					
					
					if(cur_downloads==0){
						write("Download Done!");
					
						
							write("<i></i> Packing file for download...");
						
									$.post( "http://w2a.us.to/wat/getpackage.php", { wattcode: wattcode,chapters: chaptersJSON,accesscode: accesscode } )
										 .done(function( data ) {
											
										 var xd = data.match(/([a-f0-9]{32})([0-9]+)_FULLPACKAGED/);
										var bookid = (xd[2]);
											$.get("http://w2a.us.to/wat/jasper/builds/FULL_STORY_"+bookid+".txt")
											.done(function(data,status){
												if(status =="success"){
													writeFile(data,"FULL_STORY_" + bookid + ".txt");
												}
											});
										 });
										 
									//FULL_STORY_3710071.txt
									
								
						
						updateDownloadCounter(cur_downloads,error_downloads.length);
					} else if(cur_downloads==1){
						write("<c>" + cur_downloads + " Download Left, "+errors+" errors so far.</c>");
						updateDownloadCounter(cur_downloads,error_downloads.length);
					} else {
						write("<c>" + cur_downloads + " Downloads Remaining, "+errors+" errors so far.</c>");
						updateDownloadCounter(cur_downloads,error_downloads.length);
					}
			});
			cur_downloads++;
			write("<e>" + cur_downloads + " Downloads Started</e>");
		}
		function updateDownloadCounter(count,errors){
			//$('.count').text(count);
			//$('.errors').text(errors);
		}
		function write(msg){
			$(".console").html(msg);
		}
		function addDownload(file){
			$(".downloads").append(file);
		}
		function doneDownload(wattcode){
			$("#chap" + wattcode).children("i").html("Done").attr("class","check");
		}
